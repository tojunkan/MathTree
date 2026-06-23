"""
解析 indexed TXT 中的引用。
依赖全局锚点表 (anchors.json)，在所有文章 build_index 完成后运行。

- 同文章 REF [REF:text|Article#anchor] → [REF:text|idx:N]
- 跨文章 EXT [EXT:text|name:Article#anchor] → [EXT:text|idx:N]
- 清除 @@ANCHOR:id@@ / @@/ANCHOR:id@@ 标记
"""

import json
import re
import argparse
from pathlib import Path

BASE_DIR = Path(__file__).parent
INDEXED_DIR = BASE_DIR / "output" / "indexed"
ANCHOR_FILE = BASE_DIR / "output" / "anchors.json"


def load_anchor_map() -> dict[str, dict[str, list]]:
    """加载全局锚点表: {article: {anchor_id: [start, end]}}"""
    if not ANCHOR_FILE.exists():
        return {}
    return json.loads(ANCHOR_FILE.read_text(encoding="utf-8"))


def resolve_article(article_name: str, anchor_map: dict) -> str | None:
    input_path = INDEXED_DIR / f"{article_name}.txt"
    if not input_path.exists():
        return None
    text = input_path.read_text(encoding="utf-8")

    # Resolve REF (same article): [REF:text|Article#anchor] → [REF:text|idx:N]
    my_anchors = anchor_map.get(article_name, {})

    def _resolve_ref(m):
        ref_text = m.group(1)
        ref_article = m.group(2)
        anchor = m.group(3)
        if ref_article == article_name and anchor in my_anchors:
            rng = my_anchors[anchor]
            if rng[0] == rng[1]:
                return f"[REF:{ref_text}|idx:{rng[0]}]"
            else:
                return f"[REF:{ref_text}|idx:{rng[0]}-{rng[1]}]"
        return f"[REF:{ref_text}]"

    text = re.sub(
        r"\[REF:([^\]|]+)\|([^#]+)#([^\]]+)\]",
        _resolve_ref,
        text,
    )

    # Resolve EXT (cross article): [EXT:text|name:Article#anchor] → [EXT:text|idx:N]
    def _resolve_ext(m):
        ref_text = m.group(1)
        ref_article = m.group(2)
        anchor = m.group(3)
        ext_anchors = anchor_map.get(ref_article, {})
        if anchor in ext_anchors:
            rng = ext_anchors[anchor]
            if rng[0] == rng[1]:
                return f"[EXT:{ref_text}|idx:{rng[0]}]"
            else:
                return f"[EXT:{ref_text}|idx:{rng[0]}-{rng[1]}]"
        return m.group(0)  # anchor 找不到，保留原样

    text = re.sub(
        r"\[EXT:([^\]|]+)\|name:([^#]+)#([^\]]+)\]",
        _resolve_ext,
        text,
    )

    # Resolve FN idx（脚注引用 → 脚注内容 clause）
    text_lines = text.split("\n")
    fn_re = re.compile(r"\[FN:(\d+)\](?!\|idx:)")
    clause_re = re.compile(r"^\[(\d+)\] ")
    # 收集脚注内容位置 ([FN:n] 出现在行首附近，是内容 clause 不是引用)
    fn_content_idx: dict[str, int] = {}
    for li, line in enumerate(text_lines):
        m = clause_re.match(line)
        if m:
            cidx = int(m.group(1))
            # 行以 [FN:n] 开头（前面只有索引和空格）→ 这是脚注内容
            fn_match = re.match(r"^\[\d+\]\s*\[FN:(\d+)\]", line)
            if fn_match:
                fn_content_idx[fn_match.group(1)] = cidx
    # 回填引用
    for li, line in enumerate(text_lines):
        m = clause_re.match(line)
        if m:
            cidx = int(m.group(1))
            for fm in fn_re.finditer(line):
                fn_num = fm.group(1)
                if fn_num in fn_content_idx:
                    target = fn_content_idx[fn_num]
                    text_lines[li] = text_lines[li].replace(
                        f"[FN:{fn_num}]", f"[FN:{fn_num}|idx:{target}]"
                    )
    text = "\n".join(text_lines)

    # 清除 ANCHOR 标记
    text = re.sub(r"@@/ANCHOR:\S+?@@", "", text)
    text = re.sub(r"@@ANCHOR:\S+?@@", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--article", type=str)
    parser.add_argument("--all", action="store_true")
    args = parser.parse_args()

    INDEXED_DIR.mkdir(parents=True, exist_ok=True)
    anchor_map = load_anchor_map()
    print(f"Loaded anchors for {len(anchor_map)} articles")

    if args.article:
        result = resolve_article(args.article, anchor_map)
        if result:
            (INDEXED_DIR / f"{args.article}.txt").write_text(result, encoding="utf-8")
            print(f"Resolved: {args.article}")
        else:
            print(f"FAILED: {args.article}")
    elif args.all:
        total = 0
        for f in sorted(INDEXED_DIR.glob("*.txt")):
            name = f.stem
            result = resolve_article(name, anchor_map)
            if result:
                (INDEXED_DIR / f"{name}.txt").write_text(result, encoding="utf-8")
                total += 1
        print(f"Resolved {total} articles")


if __name__ == "__main__":
    main()
