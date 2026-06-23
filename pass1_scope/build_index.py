"""
Pass 1 预处理：HTML → indexed TXT + 锚点表。

直接正则解析 HTML 文本，不依赖 DOM 树操作。
"""

import json
import re
import argparse
from pathlib import Path

BASE_DIR = Path(__file__).parent
PROJECT_DIR = BASE_DIR.parent
RAW_DIR = PROJECT_DIR / "data" / "wuliwiki_raw"
OUTPUT_DIR = BASE_DIR / "output"
INDEXED_DIR = OUTPUT_DIR / "indexed"

ENV_KEYWORDS = ["定义", "定理", "引理", "推论", "公理", "命题", "性质", "例", "例题", "习题"]


def _clean(text: str) -> str:
    text = text.replace("&gt;", ">").replace("&lt;", "<").replace("&amp;", "&")
    text = text.replace("&nbsp", " ").replace("&quot;", '"')
    text = text.replace("　", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _strip_tags(html: str) -> str:
    """移除所有 HTML 标签，保留文本"""
    return _clean(re.sub(r"<[^>]+>", "", html))


# ═══════════════════════════════════════════════
# Step 1: 从原始 HTML 文本中处理
# ═══════════════════════════════════════════════

def _replace_links_in_text(html: str, article_name: str) -> str:
    """替换所有 <a> 为 [REF:text|article#anchor]，排除 ret 和外网。"""
    def _replace_link(m):
        href = m.group(1)
        text = _strip_tags(m.group(2))
        if not text.strip(): return ""
        if "://" in href.split("#")[0] and "wuli.wiki" not in href: return text
        if re.search(r"#ret\d+", href): return text
        anchor = ""
        article = ""
        if "#" in href:
            anchor = href.rsplit("#", 1)[-1]
            path = href.rsplit("#", 1)[0]
            if "/" in path:
                article = path.rsplit("/", 1)[-1].replace(".html", "")
        ref_article = article or article_name
        prefix = "EXT" if (article and article != article_name) else "REF"
        return f"[{prefix}:{text.strip()}|{ref_article}#{anchor}]"
    return re.sub(r"<a\s[^>]*?href\s*=\s*[\"']([^\"']+)[\"'][^>]*>(.*?)</a>", _replace_link, html, flags=re.DOTALL)


def process_html(raw_html: str, article_name: str) -> tuple[str, dict, list, str, str]:
    """
    直接正则处理 HTML 文本。
    返回 (processed_html, footnotes, environments, title, sections_text)
    """
    # ── 提取标题 ──
    title_m = re.search(r"<h1>(.*?)</h1>", raw_html, re.DOTALL)
    title = _clean(title_m.group(1)) if title_m else ""

    # ── 移除无用区域 ──
    html = raw_html
    # 移除导航/页脚
    html = re.sub(r"<div class=\"w3-gray\".*?</div>\s*</div>\s*$", "", html, flags=re.DOTALL)
    html = re.sub(r"<div class=\"w3-panel w3-round-large w3-pale-green\">.*?</div>", "", html, flags=re.DOTALL)
    html = re.sub(r"<script.*?</script>", "", html, flags=re.DOTALL)
    html = re.sub(r"<style.*?</style>", "", html, flags=re.DOTALL)

    # ── Step 1a: 提取脚注 — 先替换 <a>，再提取 ──
    hr_match = re.search(r"<hr[^>]*>(.*)", html, re.DOTALL)
    footnotes: dict[str, str] = {}
    if hr_match:
        fn_area = hr_match.group(1)
        html = html[:hr_match.start()]
        # 截断在 footer 之前
        fn_area = re.sub(r"<h2[^>]*>参考文献</h2>.*", "", fn_area, flags=re.DOTALL)
        fn_area = re.sub(r"<div class=\"w3-container w3-gray\".*", "", fn_area, flags=re.DOTALL)
        # 在脚注区域也替换 <a>
        fn_area = _replace_links_in_text(fn_area, article_name)
        # strip tags 后匹配 N. ^
        fn_text = re.sub(r"<[^>]+>", "", fn_area)
        for m in re.finditer(r"(\d+)\.\s*\^\s*(.*?)(?=\n?\d+\.\s*\^|$)", fn_text, re.DOTALL):
            num = m.group(1)
            content = _clean(m.group(2))
            if content:
                footnotes[num] = content

    # ── Step 1b+c: 统一收集所有修改（位置+删除长度+插入文本），从后往前应用 ──
    mods: list[tuple[int, int, str]] = []  # (pos, delete_len, insert_text)

    # ret 锚点：<a id="retN"> 前后
    for m in re.finditer(r"<a\s[^>]*?\bid\s*=\s*[\"']ret(\d+)[\"'][^>]*>(.*?)</a>", html, flags=re.DOTALL):
        fn_num = m.group(1)
        mods.append((m.end(), 0, f"\n@@/ANCHOR:ret{fn_num}@@\n"))
        mods.append((m.start(), 0, f"\n@@ANCHOR:ret{fn_num}@@\n"))

    # span 锚点：替换 span → 开标签，找后续 div → 闭标签
    for m in re.finditer(
        r"<span\s[^>]*?\bid\s*=\s*[\"']((the_|def_|eq_|lem_|cor_|ex_|fig_|exe_|sub_)\w+)[\"'][^>]*>\s*</span>", html
    ):
        start, end = m.start(), m.end()
        aid = m.group(1)
        prefix = m.group(2)
        rest = html[end:]

        # 替换 span 为开标签
        mods.append((start, end - start, f"\n@@ANCHOR:{aid}@@\n"))

        # 找闭合位置
        if prefix == "eq_":
            dm = re.search(r"<div\s[^>]*class\s*=\s*[\"']eq[\"'][^>]*>", rest)
        else:
            dm = re.search(r"<div\s[^>]*class\s*=\s*[\"']w3-panel\s", rest)
        if dm:
            body_start = end + dm.end()
            depth = 1; pos = body_start
            while pos < len(html) and depth > 0:
                no = re.search(r"<div\b", html[pos:])
                nc = re.search(r"</div>", html[pos:])
                if not nc: break
                if no and no.start() < nc.start(): depth += 1; pos += no.end()
                else: depth -= 1; pos += nc.end()
                if depth == 0:
                    mods.append((pos, 0, f"\n@@/ANCHOR:{aid}@@\n"))
                    break

    # 从后往前应用
    for pos, dlen, text in sorted(mods, key=lambda x: -x[0]):
        html = html[:pos] + text + html[pos + dlen:]

    # ── Step 1d: 全部 <a> → [REF:text|article#anchor] ──
    html = _replace_links_in_text(html, article_name)

    # ── Step 1e: <sup> 移除（已在 <a> 替换时处理）──
    html = re.sub(r"</?sup[^>]*>", "", html)

    # ── Step 1f: 提取环境标记 ──
    environments = []
    for m in re.finditer(r"<h3[^>]*>.*?<b>([^<]+)</b>", html):
        b_text = m.group(1).strip()
        for kw in ENV_KEYWORDS:
            if kw in b_text:
                title_part = re.sub(r".*?</b>\s*(.*?)</h3>", r"\1", m.group(0), flags=re.DOTALL)
                title_part = _clean(title_part)
                environments.append({"type": kw, "heading": b_text, "title": title_part})
                break

    # ── Step 1g: 提取 sections ──
    sections = []
    for m in re.finditer(r"<h([234])[^>]*?>(.*?)</h\1>", html):
        level = int(m.group(1))
        heading = _strip_tags(m.group(2))
        if heading and heading not in ("参考文献", "致读者"):
            sections.append({"level": level, "heading": heading})

    return html, footnotes, environments, title


# ═══════════════════════════════════════════════
# Step 2: 从处理后的 HTML 提取 blocks
# ═══════════════════════════════════════════════

def _split_to_clauses(text: str) -> list[str]:
    """分句"""
    display_blocks: list[str] = []

    def _protect(m):
        display_blocks.append(m.group(0))
        return f" __DM{len(display_blocks)-1}__ "

    text = re.sub(r"\$\$[\s\S]+?\$\$", _protect, text)

    begin_re = re.compile(r"\\begin\{([^}]+)\}")
    end_re = re.compile(r"\\end\{([^}]+)\}")
    result: list[str] = []
    i = 0
    while i < len(text):
        bm = begin_re.search(text, i)
        if bm is None:
            result.append(text[i:]); break
        result.append(text[i:bm.start()])
        depth, j = 1, bm.end()
        while j < len(text) and depth > 0:
            nb, ne = begin_re.search(text, j), end_re.search(text, j)
            if ne is None: break
            if nb and nb.start() < ne.start(): depth += 1; j = nb.end()
            else:
                depth -= 1
                if depth == 0:
                    full = text[bm.start():ne.end()]
                    display_blocks.append(full)
                    result.append(f" __DM{len(display_blocks)-1}__ ")
                    j = ne.end()
                else: j = ne.end()
        if depth > 0: result.append(text[bm.start():j])
        i = j
    text = "".join(result)

    text = re.sub(r"(?<=[。！？])(?=\s*\S[^\n])", "\n", text)
    text = re.sub(r"(?<=；)(?=\s*\S)", "\n", text)
    text = re.sub(r"(?<=，)(?=(?:则|故|因此|所以|于是|从而|那么|即|可见|由此|因而|但|除非))", "\n", text)

    raw = [line.strip() for line in text.split("\n") if line.strip()]
    clauses = []
    for part in raw:
        for idx, dm in enumerate(display_blocks):
            part = part.replace(f"__DM{idx}__", dm)
        if part.strip(): clauses.append(part.strip())
    return clauses


def extract_blocks(html: str, footnotes: dict) -> list[list[str]]:
    """从处理后的 HTML 提取 blocks，按 h2/h3 和 panel 边界切分。"""
    html = _clean(html)
    blocks: list[list[str]] = []  # [[heading, clause1, clause2, ...], ...]
    block_headings: list[str] = []

    # 按 ## 标题或 panel <b> 标记切分
    # 先按 <h2> 或 <h3> 或 <b>环境关键词 切分
    parts = re.split(r"(<h[234][^>]*>.*?</h[234]>|<b>(?:定义|定理|引理|推论|公理|命题|性质|例|例题|习题)[^<]*</b>)", html)

    current_heading = ""
    current_text: list[str] = []

    for part in parts:
        part = part.strip()
        if not part: continue

        # 标题行
        h_match = re.match(r"<h([234])[^>]*>(.*?)</h\1>", part)
        b_match = re.match(r"<b>((?:定义|定理|引理|推论|公理|命题|性质|例|例题|习题)[^<]*)</b>", part)

        if h_match or b_match:
            if current_text:
                # 提取 heading 文本
                heading = _strip_tags(current_heading) if current_heading else ""
                if not heading and b_match:
                    heading = b_match.group(1)
                clauses = _split_to_clauses(" ".join(current_text))
                if clauses or heading:
                    blocks.append({"heading": heading, "clauses": clauses})
                current_text = []
            if h_match:
                current_heading = _strip_tags(part)
            elif b_match:
                current_heading = b_match.group(1)
        else:
            # 普通文本
            text = _strip_tags(part)
            if text:
                current_text.append(text)

    # 最后一个 block
    if current_text:
        clauses = _split_to_clauses(" ".join(current_text))
        blocks.append({"heading": _strip_tags(current_heading), "clauses": clauses})

    # ── 后处理：将 block 末尾的 @@ANCHOR 移到下一个 block 开头 ──
    for bi in range(len(blocks) - 1):
        this_clauses = blocks[bi]["clauses"]
        next_clauses = blocks[bi + 1]["clauses"]
        # 从当前 block 末尾收集纯 ANCHOR 行
        moved = []
        while this_clauses and re.match(r"^\s*@@ANCHOR:\S+?@@\s*$", this_clauses[-1]):
            moved.insert(0, this_clauses.pop())
        # 插入到下一个 block 开头
        for anchor_line in moved:
            next_clauses.insert(0, anchor_line)

    return blocks


# ═══════════════════════════════════════════════
# Step 3: build_indexed
# ═══════════════════════════════════════════════

def build_indexed(blocks: list[dict], footnotes: dict, environments: list, title: str, article_name: str) -> tuple[str, dict]:
    """输出 indexed TXT + anchor_ranges"""

    # ── 脚注放置：找到 retN ANCHOR 所在 block，追加到末尾 ──
    for fn_num in sorted(footnotes.keys(), key=int):
        ret_anchor = f"ret{fn_num}"
        fn_text = footnotes[fn_num]

        for bi, block in enumerate(blocks):
            found = False
            for ci, clause in enumerate(block["clauses"]):
                if f"@@ANCHOR:{ret_anchor}@@" in clause:
                    found = True
                    break
            if found:
                note_id = f"note{fn_num}"
                # 插在 block 内最后一个 [N] 子句之后
                insert_pos = len(block["clauses"])
                for ci in range(len(block["clauses"]) - 1, -1, -1):
                    if re.match(r"^\[\d+[a-z]?\]", block["clauses"][ci]):
                        insert_pos = ci + 1
                        break
                block["clauses"].insert(insert_pos, f"\n@@ANCHOR:{note_id}@@")
                block["clauses"].insert(insert_pos + 1, fn_text)
                block["clauses"].insert(insert_pos + 2, f"@@/ANCHOR:{note_id}@@")
                break

    # ── 收集锚点范围 + 输出 ──
    anchor_ranges: dict[str, list] = {}
    open_anchors: dict[str, int] = {}

    parts = [
        f"文章名: {article_name}",
        f"标题: {title}",
    ]
    if environments:
        parts.append("\n环境标记 (hints):")
        for ei, env in enumerate(environments):
            parts.append(f"  [{ei}] type={env['type']} heading={env.get('heading','')} title={env.get('title','')}")

    display_idx = 0
    for bi, block in enumerate(blocks):
        heading = block.get("heading", "")
        parts.append(f"\n## Block {bi}: {heading}（索引 {display_idx}）\n")
        for clause in block["clauses"]:
            stripped = clause.strip()
            # 纯 ANCHOR 行不占索引
            if re.match(r"^@@ANCHOR:\S+?@@$", stripped):
                parts.append(stripped)
                for m in re.finditer(r"@@ANCHOR:(\S+?)@@", stripped):
                    open_anchors[m.group(1)] = display_idx
                continue
            if re.match(r"^@@/ANCHOR:\S+?@@$", stripped):
                parts.append(stripped)
                for m in re.finditer(r"@@/ANCHOR:(\S+?)@@", stripped):
                    aid = m.group(1)
                    if aid in open_anchors:
                        anchor_ranges[aid] = [open_anchors[aid], display_idx - 1]
                        del open_anchors[aid]
                continue

            for m in re.finditer(r"@@ANCHOR:(\S+?)@@", clause):
                open_anchors[m.group(1)] = display_idx
            for m in re.finditer(r"@@/ANCHOR:(\S+?)@@", clause):
                aid = m.group(1)
                if aid in open_anchors:
                    anchor_ranges[aid] = [open_anchors[aid], display_idx]
                    del open_anchors[aid]

            display = clause if len(clause) <= 500 else clause[:250] + "…[truncated]…" + clause[-250:]
            parts.append(f"[{display_idx}] {display}")
            display_idx += 1

    for aid, start in open_anchors.items():
        anchor_ranges[aid] = [start, display_idx - 1]

    return "\n".join(parts), anchor_ranges


# ═══════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--article", type=str)
    parser.add_argument("--all", action="store_true")
    args = parser.parse_args()

    INDEXED_DIR.mkdir(parents=True, exist_ok=True)

    if args.article:
        html_paths = [RAW_DIR / f"{args.article}.html"]
    else:
        html_paths = sorted(RAW_DIR.glob("*.html"))
    print(f"Building indexed input from {len(html_paths)} HTML files")

    # 锚点表：--all 清空，--article 追加
    anchor_path = OUTPUT_DIR / "anchors.json"
    if args.all and anchor_path.exists():
        anchor_path.unlink()
    all_anchors = json.loads(anchor_path.read_text(encoding="utf-8")) if anchor_path.exists() else {}
    success = 0
    for html_path in html_paths:
        name = html_path.stem
        try:
            raw = html_path.read_text(encoding="utf-8")

            # Step 1: 正则处理 HTML
            processed, footnotes, environments, title = process_html(raw, name)

            # Step 2: 提取 blocks
            blocks = extract_blocks(processed, footnotes)

            # Step 3: build_indexed
            indexed, anchors = build_indexed(blocks, footnotes, environments, title, name)

            (INDEXED_DIR / f"{name}.txt").write_text(indexed, encoding="utf-8")
            if anchors:
                all_anchors[name] = anchors

            clauses = indexed.count("\n[")
            print(f"  {name}: {len(blocks)} blocks, {clauses} clauses, {len(anchors)} anchors")
            success += 1
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"  {name}: FAIL - {e}")

    if all_anchors:
        anchor_path.write_text(json.dumps(all_anchors, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Anchors saved: {len(all_anchors)} articles")

    print(f"Done. {success}/{len(html_paths)}")


if __name__ == "__main__":
    main()
