r"""
Build indexed input for LLM Pass 1.
直接从原始 HTML → indexed TXT + 链接清单，不落地中间 JSON。

用法:
  python build_index.py              # 全量 741 篇
  python build_index.py --article LimOp  # 单篇
"""

import json
import os
import re
import sys
import argparse
from pathlib import Path
from collections import defaultdict

from bs4 import BeautifulSoup, NavigableString, Tag

BASE_DIR = Path(__file__).parent
RAW_DIR = BASE_DIR / "data" / "wuliwiki_raw"
INDEXED_DIR = BASE_DIR / "pass1_scope" / "output" / "indexed"
LINKS_DIR = BASE_DIR / "pass1_scope" / "output" / "links"

# ── 环境类型映射 ──
ENV_KEYWORDS: dict[str, str] = {
    "定义": "definition", "定理": "theorem", "引理": "lemma",
    "推论": "corollary", "公理": "axiom", "命题": "proposition",
    "性质": "property_statement", "例": "example", "例题": "example",
    "习题": "exercise",
}

# ── 工具 ──

def _clean(text: str) -> str:
    text = text.replace("&gt;", ">").replace("&lt;", "<").replace("&amp;", "&")
    text = text.replace("&nbsp", " ").replace("&quot;", '"').replace("&apos;", "'")
    text = text.replace("　", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _extract_text(elem) -> str:
    if elem is None:
        return ""
    for tag in elem.find_all(["img", "svg"]):
        tag.decompose()
    return _clean(elem.get_text())


# ── 显示公式保护（正确处理嵌套环境）──

def _protect_display_math(text: str) -> tuple[str, list[str]]:
    blocks: list[str] = []

    def _protect_dd(m):
        blocks.append(m.group(0))
        return f" __DM{len(blocks)-1}__ "

    text = re.sub(r"\$\$[\s\S]+?\$\$", _protect_dd, text)

    begin_re = re.compile(r"\\begin\{([^}]+)\}")
    end_re = re.compile(r"\\end\{([^}]+)\}")

    result: list[str] = []
    i = 0
    while i < len(text):
        bm = begin_re.search(text, i)
        if bm is None:
            result.append(text[i:])
            break
        result.append(text[i:bm.start()])
        depth = 1
        j = bm.end()
        while j < len(text) and depth > 0:
            nb = begin_re.search(text, j)
            ne = end_re.search(text, j)
            if ne is None:
                break
            if nb and nb.start() < ne.start():
                depth += 1
                j = nb.end()
            else:
                depth -= 1
                if depth == 0:
                    full = text[bm.start():ne.end()]
                    blocks.append(full)
                    result.append(f" __DM{len(blocks)-1}__ ")
                    j = ne.end()
                else:
                    j = ne.end()
        if depth > 0:
            result.append(text[bm.start():j])
        i = j

    return "".join(result), blocks


# ── 子句切分 ──

def _split_to_clauses(text: str) -> list[str]:
    text, math_blocks = _protect_display_math(text)
    # 按标点切分
    text = re.sub(r"(?<=[。！？])(?=\s*\S[^\n])", "\n", text)
    text = re.sub(r"(?<=；)(?=\s*\S)", "\n", text)
    text = re.sub(r"(?<=，)(?=(?:则|故|因此|所以|于是|从而|那么|即|可见|由此|因而|但|除非))", "\n", text)
    text = re.sub(r"(?<=[。〕）])(?=(?:证明|证)[：:\s])", "\n", text)
    raw = [line.strip() for line in text.split("\n") if line.strip()]
    clauses = []
    for part in raw:
        for i, dm in enumerate(math_blocks):
            part = part.replace(f"__DM{i}__", dm)
        part = part.strip()
        if part:
            clauses.append(part)
    return clauses


# ── 链接提取 ──

def _extract_link_info(a_tag: Tag) -> dict | None:
    """提取 <a> 标签中的有用链接信息。"""
    href = a_tag.get("href", "")
    text = a_tag.get_text(strip=True)
    if not text or len(text) < 1:
        return None
    if "javascript:" in href:
        return None
    # 分类
    if "wuli.wiki/online/" in href and href.endswith(".html"):
        target = href.rsplit("/", 1)[-1].replace(".html", "")
        return {"type": "cross_ref", "text": text, "target_article": target}
    if re.search(r"note\d+", href):
        return {"type": "footnote_ref", "text": text, "href": href}
    if re.search(r"bib\d+", href):
        return {"type": "bib_ref", "text": text, "href": href}
    if re.search(r"fig_|ex_|eq_|def_|tab_|the_", href):
        return {"type": "internal_ref", "text": text, "href": href}
    return None


# ── DOM 遍历提取 blocks ──

def _extract_from_html(html_path: Path) -> dict:
    """从原始 HTML 提取所有内容，返回 {title, sections, environments, blocks, links}。"""
    soup = BeautifulSoup(html_path.read_text(encoding="utf-8"), "lxml")

    # 清理
    for el in soup.select("div.w3-gray, div.w3-pale-green, script, style"):
        el.decompose()

    # 标题
    h1 = soup.find("h1")
    title = _extract_text(h1) if h1 else ""

    # 定位正文容器
    card = soup.select_one("div.w3-card-4")
    containers = card.find_all("div", class_="w3-container", recursive=False) if card else []
    main = None
    for c in containers:
        if not c.find("h1") and "w3-blue" not in " ".join(c.get("class", [])):
            main = c
            break
    if main is None and containers:
        main = containers[-1]

    # 收集章节
    sections: list[dict] = []
    for tag in soup.find_all(["h2", "h3", "h4"]):
        if tag.find_parent("div", class_="w3-gray"):
            continue
        if tag.find_parent("div", class_=lambda c: c and "w3-panel" in c and "w3-border" in c):
            continue
        heading = _extract_text(tag)
        if heading and heading not in ("参考文献", "致读者"):
            sections.append({"level": int(tag.name[1]), "heading": heading})

    # 收集环境标记
    environments: list[dict] = []
    seen: set[str] = set()
    for panel in soup.select("div.w3-panel.w3-border-red, div.w3-panel.w3-border-yellow, div.w3-panel.w3-border-green"):
        h3 = panel.find("h3")
        if not h3:
            continue
        b_tag = h3.find("b")
        if not b_tag:
            continue
        b_text = b_tag.get_text(strip=True)
        for keyword, env_type in ENV_KEYWORDS.items():
            if keyword in b_text:
                key = b_text
                if key not in seen:
                    seen.add(key)
                    full_text = h3.get_text()
                    idx = full_text.find(b_text)
                    env_title = full_text[idx + len(b_text):].replace("　", "").strip() if idx >= 0 else ""
                    environments.append({"type": env_type, "heading": b_text, "title": env_title})
                break

    # ── 核心：遍历 main 的子元素，分 block 提取 ──
    blocks: list[dict] = []
    links: list[dict] = []
    current_heading: dict | None = None
    current_parts: list[str] = []
    global_link_idx = 0

    def _flush_block():
        nonlocal current_heading, current_parts
        if current_heading is not None and current_parts:
            blocks.append({
                "level": current_heading["level"],
                "heading": current_heading["heading"],
                "text": "\n\n".join(current_parts),
            })
        current_heading = None
        current_parts = []

    # 先收集所有直接子元素（含 NavigableString）
    if main:
        for child in main.children:
            if not hasattr(child, "name") or child.name is None:
                text = _clean(str(child))
                if text and len(text) > 3:
                    current_parts.append(text)
                continue

            tag_name = child.name

            # h2/h3/h4 — 新 block
            if tag_name in ("h2", "h3", "h4"):
                heading_text = _extract_text(child)
                if heading_text and heading_text not in ("参考文献", "致读者"):
                    # 如果第一个标题前有内容，先存为 preamble block
                    if current_heading is None and current_parts:
                        blocks.append({"level": 1, "heading": "", "text": "\n\n".join(current_parts)})
                        current_parts = []
                    else:
                        _flush_block()
                    current_heading = {"level": int(tag_name[1]), "heading": heading_text}
                else:
                    _flush_block()
                continue

            # 面板 — 检查是否环境面板（定义/定理/例…），是则新建 block
            if tag_name == "div" and "w3-panel" in child.get("class", []):
                cls = " ".join(child.get("class", []))
                if "w3-sand" in cls:
                    text = _extract_text(child)
                    text = re.sub(r"^未完成[：:]\s*", "【未完成】", text)
                    if text:
                        current_parts.append(text)
                    continue
                if "w3-light-blue" in cls:
                    continue

                # 检查是否是数学环境面板（红/黄/绿边框）
                h3 = child.find("h3")
                env_heading = None
                if h3:
                    b_tag = h3.find("b")
                    if b_tag:
                        b_text = b_tag.get_text(strip=True)
                        for keyword in ENV_KEYWORDS:
                            if keyword in b_text:
                                env_heading = b_text
                                break

                if env_heading:
                    # 环境面板 → 新建 block。之后的内容（含面板外正文）归入此 block，
                    # 直到下一个面板或标题出现。
                    _flush_block()
                    current_heading = {"level": 3, "heading": env_heading}

                # 收集面板内的所有文本
                for sub in child.children:
                    if not hasattr(sub, "name") or sub.name is None:
                        continue
                    sub_text = _extract_text(sub)
                    if sub_text and len(sub_text) > 3:
                        current_parts.append(sub_text)

                # 注意：不在这里 flush——面板后的 prose/proof 也归入此 block
                continue

            # 显示公式
            if tag_name == "div" and "eq" in child.get("class", []):
                text = _extract_text(child)
                if text:
                    current_parts.append(text)
                continue

            # 图解
            if tag_name == "div" and child.get("align") == "center":
                text = _extract_text(child)
                if text and len(text) > 5 and not child.find("table"):
                    current_parts.append("【图解】" + text)
                continue

            # <a> 标签 — 提取为链接清单，同时在正文中保留文本
            if tag_name == "a":
                link_info = _extract_link_info(child)
                text = child.get_text(strip=True)
                if link_info:
                    link_info["id"] = f"L{global_link_idx}"
                    links.append(link_info)
                    # 在正文中用占位符标记
                    current_parts.append(f"{text} [链接 L{global_link_idx}]")
                    global_link_idx += 1
                elif text:
                    current_parts.append(text)
                continue

            # 段落、列表
            if tag_name in ("p", "ul", "ol"):
                # 检查此元素内是否有链接
                sub_links = child.find_all("a", href=True)
                text = _extract_text(child)
                if not text or len(text) < 3:
                    continue
                # 不在此处标记链接——链接文本已在 get_text() 中
                if re.match(r"贡献者[：:]", text):
                    continue
                if re.match(r"^\d+\.\s*\^", text):
                    continue
                current_parts.append(text)
                continue

            # 其他 div / span — 有文本就收集
            if tag_name in ("div", "span"):
                # 跳过图片容器
                if child.find("img"):
                    continue
                text = _extract_text(child)
                if text and len(text) > 5:
                    current_parts.append(text)
                continue

            # <b> — 独立加粗术语（不在 p/li 内的）
            if tag_name == "b":
                text = child.get_text(strip=True)
                if text and len(text) > 1:
                    current_parts.append(text)
                continue

            # sup — 脚注引用
            if tag_name == "sup":
                text = child.get_text(strip=True)
                if text:
                    current_parts.append(text)
                continue

        # flush last block
        _flush_block()

    # 兜底：如果整篇文章没有 h2/h3，把所有内容做一个 block
    if not blocks and main:
        all_text = _extract_text(main)
        if all_text:
            blocks = [{"level": 1, "heading": title, "text": all_text}]

    return {
        "title": title,
        "sections": sections,
        "environments": environments,
        "blocks": blocks,
        "links": links,
    }


# ── 构建 LLM 输入 ──

def build_indexed(extracted: dict, article_name: str) -> str:
    parts = [
        f"文章名: {article_name}",
        f"标题: {extracted['title']}",
    ]
    if extracted.get("environments"):
        parts.append("\n环境标记 (hints):")
        for ei, env in enumerate(extracted["environments"]):
            parts.append(f"  [{ei}] type={env['type']} heading={env.get('heading','')} title={env.get('title','')}")
    parts.append(f"\n正文（{len(extracted.get('blocks', []))} 个 block，每个子句前的数字是唯一索引）:")
    global_idx = 0
    for bi, block in enumerate(extracted.get("blocks", [])):
        parts.append(f"\n## Block {bi}: {block['heading']}（索引 {global_idx}）\n")
        clauses = _split_to_clauses(block["text"])
        for clause in clauses:
            display = clause if len(clause) <= 500 else clause[:250] + "…[truncated]…" + clause[-250:]
            parts.append(f"[{global_idx}] {display}")
            global_idx += 1
    # 链接清单（精简，只放有 target_article 的跨文章引用）
    cross_refs = [l for l in extracted.get("links", []) if l.get("type") == "cross_ref"]
    if cross_refs:
        parts.append(f"\n\n跨文章引用:")
        for l in cross_refs:
            parts.append(f"  [{l['id']}] {l['text']} → {l['target_article']}")
    return "\n".join(parts)


# ── Main ──

def main():
    parser = argparse.ArgumentParser(description="Build indexed input from raw HTML")
    parser.add_argument("--article", type=str, help="Process single article")
    parser.add_argument("--limit", type=int, help="Process first N articles")
    args = parser.parse_args()

    INDEXED_DIR.mkdir(parents=True, exist_ok=True)
    LINKS_DIR.mkdir(parents=True, exist_ok=True)

    if args.article:
        html_paths = [RAW_DIR / f"{args.article}.html"]
    else:
        html_paths = sorted(RAW_DIR.glob("*.html"))
        if args.limit:
            html_paths = html_paths[:args.limit]

    total = len(html_paths)
    print(f"Building indexed input from {total} HTML files")
    print(f"Indexed TXT → {INDEXED_DIR}")
    print(f"Links JSON   → {LINKS_DIR}")
    print(f"{'='*60}")

    success = 0
    fail = 0

    for i, html_path in enumerate(html_paths):
        name = html_path.stem
        print(f"[{i+1:4d}/{total}] {name:<30s}", end="", flush=True)

        if not html_path.exists():
            print(" FILE NOT FOUND")
            fail += 1
            continue

        try:
            extracted = _extract_from_html(html_path)
            indexed = build_indexed(extracted, name)
            (INDEXED_DIR / f"{name}.txt").write_text(indexed, encoding="utf-8")

            if extracted.get("links"):
                (LINKS_DIR / f"{name}.json").write_text(
                    json.dumps(extracted["links"], ensure_ascii=False, indent=2),
                    encoding="utf-8",
                )

            clause_count = indexed.count("\n[")
            link_count = len(extracted.get("links", []))
            block_count = len(extracted.get("blocks", []))
            extra = f", {link_count} links" if link_count else ""
            print(f" OK ({block_count} blocks, {clause_count} clauses{extra})")
            success += 1

        except Exception as e:
            print(f" FAIL: {e}")
            fail += 1

    print(f"\n{'='*60}")
    print(f"Done. Success: {success}, Failed: {fail}")


if __name__ == "__main__":
    main()
