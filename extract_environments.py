"""
Step 3: 数学环境提取（带 Checkpoint）— 从 HTML 提取结构化数学内容。

输入：data/wuliwiki_raw/*.html + data/wuliwiki_checkpoint.json
输出：data/wuliwiki_pages/{name}.json

提取内容：
- 文章标题、章节层级
- 定义/定理/引理/推论/公理/命题/例题/习题 环境
- 定理证明（启发式）
- LaTeX 公式块
- 预备知识链接
- 交叉引用链接
"""

import json
import os
import re
import sys
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
URLS_FILE = DATA_DIR / "wuliwiki_urls.json"
CHECKPOINT_FILE = DATA_DIR / "wuliwiki_checkpoint.json"
RAW_DIR = DATA_DIR / "wuliwiki_raw"
PAGES_DIR = DATA_DIR / "wuliwiki_pages"


def tz_now() -> str:
    return datetime.now(timezone(timedelta(hours=8))).isoformat()


# ── 数学环境类型映射 ─────────────────────────────────────────
# <b> 标题文本 → (env_type, has_proof)
HEADING_MAP = {
    "定义": ("definition", False),
    "定理": ("theorem", True),
    "引理": ("lemma", True),
    "推论": ("corollary", True),
    "公理": ("axiom", False),
    "命题": ("proposition", True),
    "性质": ("property", False),
    "例": ("example", False),
    "例题": ("example", False),
    "习题": ("exercise", False),
}

PROOF_MARKERS = re.compile(r"证明|proof\.?|证(?=[\s　：:])", re.I)

# CSS 选择器
PANEL_RED = "div.w3-panel.w3-border-red.w3-leftbar"
PANEL_YELLOW = "div.w3-panel.w3-border-yellow.w3-leftbar"
PANEL_GREEN = "div.w3-panel.w3-border-green.w3-leftbar"
PANEL_LIGHT_BLUE = "div.w3-panel.w3-round-large.w3-light-blue"
PANEL_PALE_GREEN = "div.w3-panel.w3-round-large.w3-pale-green"
PANEL_SAND = "div.w3-panel.w3-round-large.w3-sand"

# LaTeX 公式提取
INLINE_MATH_RE = re.compile(r"(?<!\\)\$(.+?)(?<!\\)\$")
DISPLAY_MATH_RE = re.compile(
    r"(?<!\\)\$\$(.+?)(?<!\\)\$\$|"
    r"\\begin\{equation\*?\}(.+?)\\end\{equation\*?\}|"
    r"\\begin\{align\*?\}(.+?)\\end\{align\*?\}|"
    r"\\begin\{aligned\}(.+?)\\end\{aligned\}|"
    r"\\begin\{gather\*?\}(.+?)\\end\{gather\*?\}|"
    r"\\begin\{eqnarray\*?\}(.+?)\\end\{eqnarray\*?\}",
    re.DOTALL,
)


def extract_math_blocks(text: str) -> list[str]:
    """提取文本中的所有 LaTeX 公式块。"""
    blocks = []
    for m in INLINE_MATH_RE.finditer(text):
        blocks.append("$" + m.group(1) + "$")
    for m in DISPLAY_MATH_RE.finditer(text):
        blocks.append(m.group(0).strip())
    return blocks


def classify_panel(b_tag: Tag) -> tuple[str | None, int | None]:
    """
    根据 <b> 标签文本判断环境类型和编号。
    返回 (env_type, index) 或 (None, None)。
    """
    if b_tag is None:
        return None, None
    text = b_tag.get_text(strip=True)
    for keyword, (env_type, _) in HEADING_MAP.items():
        if keyword in text:
            # 提取编号，如 "定义 1"、"定理 3"、"推论 2.1"
            m = re.search(rf"{keyword}\s*([\d.]+)", text)
            idx = None
            if m:
                try:
                    idx = float(m.group(1))
                except ValueError:
                    idx = None
            return env_type, idx
    return None, None


def is_boundary_b(b_tag: Tag) -> bool:
    """检查 <b> 标签是否是环境边界（命中 HEADING_MAP 且不是证明标记）。"""
    if b_tag is None:
        return False
    text = b_tag.get_text(strip=True)
    # 排除证明标记——"证明"不在 HEADING_MAP 中，但以防万一
    if PROOF_MARKERS.match(text):
        return False
    env_type, _ = classify_panel(b_tag)
    return env_type is not None


def _get_heading_parent(b_tag: Tag) -> Tag:
    """获取标题 <b> 所属的容器元素（用于定位和跳过）。"""
    parent = b_tag.parent
    # 如果 parent 是 <h3> 或 <h4>，返回 parent 本身
    if parent and parent.name in ('h3', 'h4', 'h2'):
        return parent
    # 否则返回 parent（通常是 <p> 或 <div>）
    return parent if parent else b_tag


def _collect_after_heading(heading_element: Tag, soup: BeautifulSoup) -> list[Tag]:
    """
    从 heading_element 之后收集 DOM 元素，直到遇到：
    1. 下一个命中 HEADING_MAP 的 <b>
    2. <h2> 或 <h3> 章节标题（不含环境标题的 h3）
    3. 捐款栏或页脚
    返回收集到的 Tag 列表（不包含 heading_element 自身）。
    """
    collected = []
    all_b_tags = soup.find_all('b')

    # 找到当前 heading 在全文 <b> 列表中的位置
    heading_b = heading_element.find('b') if heading_element.name != 'b' else heading_element
    if heading_b is None:
        return collected

    # 找到下一个命中 HEADING_MAP 的 <b>（不是自己的）
    next_boundary_b = None
    found_self = False
    for b_tag in all_b_tags:
        if b_tag is heading_b:
            found_self = True
            continue
        if found_self and classify_panel(b_tag)[0] is not None:
            # 确认这个 b 不是证明标记
            b_text = b_tag.get_text(strip=True)
            if not PROOF_MARKERS.match(b_text):
                next_boundary_b = b_tag
                break

    # Walk DOM from heading_element forward
    current = heading_element

    while True:
        # 找下一个 DOM 节点（深度优先，跨越所有层级）
        nxt = current.find_next()
        if nxt is None:
            break

        # 遇到下一个边界 <b> 则停止
        if next_boundary_b is not None:
            # 检查 nxt 是否包含或就是 next_boundary_b
            if nxt is next_boundary_b:
                break
            if hasattr(nxt, 'find') and nxt.find('b') is next_boundary_b:
                break
            # 如果 nxt 的父元素包含 next_boundary_b
            try:
                if hasattr(nxt, 'find_all'):
                    if next_boundary_b in nxt.find_all('b'):
                        break
            except Exception:
                pass

        # 遇到章节标题 h2（不含环境标题的 h3）则停止
        if hasattr(nxt, 'name') and nxt.name == 'h2':
            break
        if hasattr(nxt, 'name') and nxt.name == 'h3':
            # h3 里有 <b> 且命中 HEADING_MAP → 停止
            b_in_h3 = nxt.find('b')
            if b_in_h3 and classify_panel(b_in_h3)[0] is not None:
                break

        # 遇到捐款/页脚则停止
        if hasattr(nxt, 'get'):
            classes = ' '.join(nxt.get('class', []))
            if 'w3-pale-green' in classes or 'w3-gray' in classes:
                break

        collected.append(nxt)
        current = nxt

    return collected


def _split_body_and_proof(collected_elements: list[Tag]) -> tuple[str, str | None, list[str], list[str]]:
    """
    从收集的 DOM 元素中分离环境主体和证明。
    返回 (body_html, proof_html, body_math_blocks, proof_math_blocks)。
    """
    body_parts = []
    proof_parts = []
    in_proof = False

    for elem in collected_elements:
        elem_str = str(elem)
        elem_text = elem.get_text() if hasattr(elem, 'get_text') else str(elem)

        if not in_proof:
            # 检查这个元素是否包含证明标记
            if PROOF_MARKERS.search(elem_text):
                in_proof = True
                # 找到证明标记在 HTML 中的位置，从此处开始切分
                m = PROOF_MARKERS.search(elem_str)
                if m:
                    body_parts.append(elem_str[:m.start()])
                    proof_parts.append(elem_str[m.start():])
                else:
                    # 标记在深层子元素中，整段归入证明
                    proof_parts.append(elem_str)
            else:
                body_parts.append(elem_str)
        else:
            # 已经在证明内部，检查是否遇到下一个环境起点
            b_in_elem = elem.find('b') if hasattr(elem, 'find') else None
            if b_in_elem and classify_panel(b_in_elem)[0] is not None:
                # 证明结束，下一个环境开始——但我们已经收集过了，这里不应该发生
                # 安全处理：截断
                break
            proof_parts.append(elem_str)

    body_html = ''.join(body_parts).strip()
    proof_html = ''.join(proof_parts).strip() if proof_parts else None

    body_math = extract_math_blocks(body_html)
    proof_math = extract_math_blocks(proof_html) if proof_html else []

    return body_html, proof_html, body_math, proof_math


def _extract_heading_info(b_tag: Tag) -> tuple[str, str, str | None]:
    """
    从标题 <b> 提取 heading_text, title, anchor_id。
    """
    heading_text = b_tag.get_text(strip=True)

    # 标题后的纯文本（环境标题/名称，如 "定义 1" 后的 "　群"）
    title = ""
    next_sib = b_tag.next_sibling
    if next_sib and isinstance(next_sib, NavigableString):
        title = str(next_sib).strip()
        title = title.replace("　", "").strip()

    # 找锚点 ID：先看 b 的父元素，再看前面的 span
    anchor_id = None
    parent = b_tag.parent
    if parent:
        anchor_id = parent.get("id", "")
    if not anchor_id:
        prev_span = b_tag.find_previous("span")
        if prev_span and prev_span.get("id", ""):
            anchor_id = prev_span.get("id", "")

    return heading_text, title, anchor_id


def extract_environment_from_b_tag(b_tag: Tag, soup: BeautifulSoup) -> dict | None:
    """
    从单个 <b> 标题标签提取完整环境（替代旧 extract_panel_content）。
    """
    env_type, env_idx = classify_panel(b_tag)
    if env_type is None:
        return None

    heading_text, title, anchor_id = _extract_heading_info(b_tag)
    heading_element = _get_heading_parent(b_tag)

    # 收集标题后的所有内容直到下一个边界
    collected = _collect_after_heading(heading_element, soup)

    # 分离主体和证明
    body_html, proof_html, body_math, proof_math = _split_body_and_proof(collected)

    # 全文（标题 + 主体 + 证明）
    heading_plain = heading_element.get_text().strip() if heading_element else heading_text
    full_text_parts = [heading_plain]
    for elem in collected:
        full_text_parts.append(elem.get_text() if hasattr(elem, 'get_text') else str(elem))
    full_text = '\n'.join(full_text_parts).strip()

    result = {
        "type": env_type,
        "index": env_idx,
        "heading": heading_text,
        "title": title,
        "anchor_id": anchor_id,
        "html": body_html,
        "text": full_text,
        "math_blocks": body_math,
    }

    # 对定理类环境附加证明
    has_proof = HEADING_MAP.get(
        next((k for k in HEADING_MAP if k in heading_text), ""), (None, False)
    )[1]
    if has_proof and proof_html:
        result["proof_html"] = proof_html
        result["proof_math_blocks"] = proof_math

    return result


def extract_sections(soup: BeautifulSoup) -> list[dict]:
    """提取文章中的章节层级。"""
    sections = []
    for tag in soup.find_all(["h2", "h3", "h4"]):
        # 跳过 Part 标题（在 teal 容器内）
        parent = tag.find_parent("div", class_="w3-teal")
        if parent:
            continue
        # 跳过导航栏内的标题
        if tag.find_parent("div", class_="w3-gray"):
            continue

        level = int(tag.name[1])  # h2→2, h3→3, h4→4
        heading = tag.get_text(strip=True)
        heading = re.sub(r"\s+", " ", heading)  # normalize whitespace
        sections.append({"level": level, "heading": heading})
    return sections


def extract_prerequisites(soup: BeautifulSoup) -> list[dict]:
    """提取预备知识框中的链接。"""
    prereqs = []
    for panel in soup.select(PANEL_LIGHT_BLUE):
        b = panel.find("b")
        if b and "预备知识" in b.get_text():
            for a in panel.find_all("a", href=True):
                href = a["href"]
                text = a.get_text(strip=True)
                if text:
                    prereqs.append({"name": text, "url": href})
    return prereqs


def extract_cross_refs(soup: BeautifulSoup, current_name: str) -> list[dict]:
    """提取文章中的交叉引用链接（指向其他 .html 文章）。"""
    refs = []
    seen = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        text = a.get_text(strip=True)
        if not text:
            continue
        if "wuli.wiki/online/" in href and href.endswith(".html"):
            target = href.rsplit("/", 1)[-1].replace(".html", "")
            if target == current_name:
                continue
            key = (target, text)
            if key not in seen:
                seen.add(key)
                refs.append({"text": text, "url": href, "target_article": target})
    return refs


def clean_soup(soup: BeautifulSoup):
    """移除不需要的元素（就地修改）。"""
    # 捐款呼吁
    for el in soup.select(PANEL_PALE_GREEN):
        el.decompose()
    # 未完成标记（但保留其内容作为参考？不，保留，它包含有用信息）
    # 实际：sand panel 包含 "未完成：..." 说明，保留文本但标记
    for el in soup.select(PANEL_SAND):
        # 保留但标记
        el["data-unfinished"] = "true"

    # 预备知识框（已单独提取，可从主体移除）
    for el in soup.select(PANEL_LIGHT_BLUE):
        el.decompose()

    # 导航栏
    for el in soup.select("div.w3-gray"):
        el.decompose()


def extract_footnotes(soup: BeautifulSoup) -> list[dict]:
    """提取文章末尾的脚注（<hr> 后的 1.^ 2.^ 格式）。"""
    footnotes = []
    hr = soup.find("hr")
    if not hr:
        return footnotes

    # 收集 <hr> 之后、捐款/页脚之前的内容
    current = hr.find_next_sibling()
    while current:
        classes = " ".join(current.get("class", []))
        # 遇到捐款栏或页脚则停止
        if "w3-pale-green" in classes or "w3-gray" in classes:
            break
        text = current.get_text()
        footnotes.append(text)
        current = current.find_next_sibling()

    full_text = "\n".join(footnotes)

    # 解析脚注格式：N. ^ 内容（N 可能延伸到多行）
    # 每个脚注以数字+句点+上箭头开始
    fn_pattern = re.compile(r"(\d+)\.\s*\^\s*(.*?)(?=\n?\d+\.\s*\^|$)", re.DOTALL)
    parsed = []
    for m in fn_pattern.finditer(full_text):
        num = int(m.group(1))
        content = m.group(2).strip()
        content = re.sub(r"\s+", " ", content)  # normalize whitespace
        # 提取脚注中的 LaTeX
        math_blocks = extract_math_blocks(content)
        parsed.append({
            "index": num,
            "text": content,
            "math_blocks": math_blocks,
        })

    return parsed


def extract_prose(soup: BeautifulSoup, covered_elements: set) -> list[dict]:
    """
    按 DOM 顺序提取未被任何环境覆盖的正文段落，含 <div class="eq"> 里的显示公式。
    """
    prose = []
    # 收集所有 prose 候选：<p> 和 <div class="eq">
    candidates = []
    for p in soup.find_all("p"):
        if p in covered_elements:
            continue
        if p.find_parent("div", class_="w3-gray"):
            continue
        b_in_p = p.find('b')
        if b_in_p and classify_panel(b_in_p)[0] is not None:
            continue
        candidates.append(('p', p))

    for eq in soup.find_all("div", class_="eq"):
        if eq in covered_elements:
            continue
        if eq.find_parent("div", class_="w3-gray"):
            continue
        # 如果 eq 已在某个环境采集的内容中则跳过
        candidates.append(('eq', eq))

    # 按 DOM 顺序排序
    all_tags = soup.find_all(True)
    def dom_index(el):
        try:
            return all_tags.index(el)
        except ValueError:
            return 99999
    candidates.sort(key=lambda x: dom_index(x[1]))

    # 合并相邻的 prose 和 eq
    merged_text = ""
    merged_math = []

    for kind, el in candidates:
        if kind == 'p':
            text = el.get_text(strip=True)
            if not text:
                continue
            if re.match(r"^贡献者[：:]", text):
                continue
            if re.match(r"^\d+\.\s*\^", text):
                continue

            math_blocks = extract_math_blocks(text)
            merged_text += text + "\n"
            merged_math.extend(math_blocks)
        elif kind == 'eq':
            eq_text = el.get_text()
            eq_math = extract_math_blocks(str(el))
            merged_text += eq_text + "\n"
            merged_math.extend(eq_math)

    # 将合并后的文本拆分为段落（按空行）
    for chunk in merged_text.split('\n\n'):
        chunk = chunk.strip()
        if not chunk:
            continue
        chunk_math = extract_math_blocks(chunk)
        prose.append({
            "text": chunk,
            "math_blocks": chunk_math,
            "has_math": len(chunk_math) > 0,
        })

    return prose


def extract_article(html: str, article_info: dict) -> dict:
    """从单篇文章 HTML 提取所有结构化内容（基于 <b> 标签导航）。"""
    soup = BeautifulSoup(html, "lxml")
    clean_soup(soup)

    name = article_info.get("name", "")

    # 标题
    title_tag = soup.find("h1")
    title = title_tag.get_text(strip=True) if title_tag else ""

    # 章节
    sections = extract_sections(soup)

    # 预备知识
    prerequisites = extract_prerequisites(soup)

    # 交叉引用
    cross_refs = extract_cross_refs(soup, name)

    # ── 基于 <b> 标签遍历提取数学环境 ──
    environments = []
    covered_elements = set()  # 追踪已被环境覆盖的 DOM 元素

    for b_tag in soup.find_all("b"):
        env = extract_environment_from_b_tag(b_tag, soup)
        if env is None:
            continue

        environments.append(env)

        # 标记被覆盖的元素（用于 prose 去重）
        heading_element = _get_heading_parent(b_tag)
        if heading_element:
            covered_elements.add(heading_element)

    # ── 兜底：收集未被任何环境覆盖的证明（孤儿证明） ──
    orphan_proofs = _collect_orphan_proofs(soup, environments, covered_elements)
    if orphan_proofs:
        # 将孤儿证明附加到最近的前一个环境（如果能确定归属）
        # 否则保留为独立条目
        pass  # 暂不实现自动挂靠，先记录日志

    # 脚注
    footnotes = extract_footnotes(soup)

    # 非面板正文（低优先级但含数学语境）
    prose = extract_prose(soup, covered_elements)

    # 付费隐藏内容检查
    hidden_divs = soup.select('div[style*="display:none"]')
    has_paywall = len(hidden_divs) > 0
    hidden_content = ""
    if has_paywall:
        hidden_content = " ".join(d.get_text(strip=True) for d in hidden_divs)

    # 统计 orphan proofs
    orphan_count = len(orphan_proofs) if orphan_proofs else 0

    return {
        "name": name,
        "title": title,
        "url": article_info.get("url", ""),
        "part": article_info.get("part", ""),
        "chapter": article_info.get("chapter", ""),
        "type": article_info.get("type", ""),
        "extracted_at": tz_now(),
        "prerequisites": prerequisites,
        "cross_refs": cross_refs,
        "sections": sections,
        "environments": environments,
        "footnotes": footnotes,
        "prose": prose,
        "has_paywall": has_paywall,
        "hidden_content": hidden_content,
        "orphan_proofs": orphan_count,
        "environment_counts": {
            t: sum(1 for e in environments if e["type"] == t)
            for t in set(e["type"] for e in environments)
        },
    }


def _collect_orphan_proofs(soup: BeautifulSoup, environments: list[dict], covered: set) -> list[dict]:
    """收集未被任何环境覆盖的孤儿证明段落。"""
    orphan_proofs = []
    # 遍历全文的 <p> 和 <div>，找含证明标记但不在 covered 中的元素
    for elem in soup.find_all(['p', 'div']):
        if elem in covered:
            continue
        text = elem.get_text()
        if PROOF_MARKERS.search(text):
            # 收集从证明标记开始到遇到下一个 <b> 标题或 h2/h3 的内容
            proof_html = str(elem)
            math_blocks = extract_math_blocks(proof_html)
            orphan_proofs.append({
                "html": proof_html,
                "text": text.strip(),
                "math_blocks": math_blocks,
            })

    # 从 environments 中移除孤儿证明条目（它们不是真正的数学环境）
    orphan_proofs = [p for p in orphan_proofs if len(p["text"]) > 5]

    return orphan_proofs


def load_checkpoint() -> dict | None:
    if CHECKPOINT_FILE.exists():
        try:
            return json.loads(CHECKPOINT_FILE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, KeyError):
            pass
    return None


def save_checkpoint(cp: dict):
    cp["updated_at"] = tz_now()
    tmp = CHECKPOINT_FILE.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(cp, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(tmp, CHECKPOINT_FILE)


def main():
    if not CHECKPOINT_FILE.exists():
        print(f"ERROR: {CHECKPOINT_FILE} not found. Run crawl_wuliwiki.py first.")
        sys.exit(1)

    PAGES_DIR.mkdir(parents=True, exist_ok=True)

    cp = load_checkpoint()
    if cp is None:
        print("ERROR: cannot load checkpoint")
        sys.exit(1)

    # 加载 URL 清单获取文章元信息
    url_data = json.loads(URLS_FILE.read_text(encoding="utf-8")) if URLS_FILE.exists() else {"articles": []}
    article_meta = {a["name"]: a for a in url_data.get("articles", [])}

    # 构建待提取列表
    to_extract = []
    for name, entry in cp["articles"].items():
        if entry.get("status") != "done":
            continue
        extract_status = entry.get("extract_status", "pending")
        if extract_status in ("extracted",):
            continue
        to_extract.append(name)

    total = len(to_extract)
    if total == 0:
        print("No articles to extract (all done or no HTML crawled).")
        return

    print(f"Extracting {total} articles")
    print(f"Output: {PAGES_DIR}")

    success = 0
    fail = 0

    for i, name in enumerate(to_extract):
        entry = cp["articles"][name]
        html_path = RAW_DIR / f"{name}.html"

        print(f"[{i+1:4d}/{total}] {name:<30s}", end="", flush=True)

        if not html_path.exists():
            entry["extract_status"] = "extract_failed"
            entry["extract_error"] = "HTML file not found"
            fail += 1
            print(f" MISSING HTML")
            continue

        try:
            html = html_path.read_text(encoding="utf-8")
            meta = article_meta.get(name, {"name": name})
            result = extract_article(html, meta)

            # 保存结构化 JSON
            output_path = PAGES_DIR / f"{name}.json"
            output_path.write_text(
                json.dumps(result, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )

            entry["extract_status"] = "extracted"
            entry["extract_error"] = None
            entry["extracted_at"] = tz_now()
            success += 1

            counts = result.get("environment_counts", {})
            count_str = " ".join(f"{k}:{v}" for k, v in sorted(counts.items()))
            print(f" OK ({count_str})")

        except Exception as e:
            entry["extract_status"] = "extract_failed"
            entry["extract_error"] = str(e)[:200]
            fail += 1
            print(f" FAIL: {e}")

        # 每 50 篇保存 checkpoint
        if (i + 1) % 50 == 0 or i == total - 1:
            # 更新统计
            done = sum(1 for a in cp["articles"].values() if a.get("extract_status") == "extracted")
            failed = sum(1 for a in cp["articles"].values() if a.get("extract_status") == "extract_failed")
            cp["stats"]["extract_done"] = done
            cp["stats"]["extract_failed"] = failed
            cp["stats"]["extract_pending"] = total - done - failed
            save_checkpoint(cp)

    # 最终统计
    done = sum(1 for a in cp["articles"].values() if a.get("extract_status") == "extracted")
    failed = sum(1 for a in cp["articles"].values() if a.get("extract_status") == "extract_failed")
    cp["stats"]["extract_done"] = done
    cp["stats"]["extract_failed"] = failed
    cp["stats"]["extract_pending"] = total - done - failed
    save_checkpoint(cp)

    print(f"\n{'='*60}")
    print(f"Extraction complete")
    print(f"  Extracted: {done}")
    print(f"  Failed:    {failed}")


if __name__ == "__main__":
    main()
