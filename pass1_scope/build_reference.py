"""
引用解析：读全局锚点表，统一替换 [REF:text|Article#anchor] → idx。
同文章和跨文章不做区分。找不到的报 unresolved。
"""

import json
import re
import argparse
from pathlib import Path

BASE_DIR = Path(__file__).parent
INDEXED_DIR = BASE_DIR / "output" / "indexed"
ANCHOR_FILE = BASE_DIR / "output" / "anchors.json"


def load_anchor_map() -> dict[str, dict[str, list]]:
    if not ANCHOR_FILE.exists():
        return {}
    return json.loads(ANCHOR_FILE.read_text(encoding="utf-8"))


def resolve_article(article_name: str, anchor_map: dict) -> tuple[str | None, list[str]]:
    input_path = INDEXED_DIR / f"{article_name}.txt"
    if not input_path.exists():
        return None, ["file not found"]
    text = input_path.read_text(encoding="utf-8")
    unresolved: list[str] = []

    def _resolve(m):
        prefix = m.group(1)  # REF or EXT
        ref_text = m.group(2)
        ref_article = m.group(3)
        anchor = m.group(4)
        anchors = anchor_map.get(ref_article, {})
        if anchor in anchors:
            rng = anchors[anchor]
            if rng[0] == rng[1]:
                return f"[{prefix}:{ref_text}|idx:{rng[0]}]"
            return f"[{prefix}:{ref_text}|idx:{rng[0]}-{rng[1]}]"
        unresolved.append(f"[{prefix}:{ref_text}|{ref_article}#{anchor}]")
        return f"[{prefix}:{ref_text}|{ref_article}#{anchor}]"

    text = re.sub(
        r"\[(REF|EXT):([^\]|]+)\|([^#]+)#([^\]]+)\]",
        _resolve,
        text,
    )

    # 清除 ANCHOR 标记
    text = re.sub(r"@@/ANCHOR:\S+?@@", "", text)
    text = re.sub(r"@@ANCHOR:\S+?@@", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text, unresolved


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--article", type=str)
    parser.add_argument("--all", action="store_true")
    args = parser.parse_args()

    anchor_map = load_anchor_map()
    print(f"Loaded {len(anchor_map)} article anchor maps")

    if args.article:
        result, unresolved = resolve_article(args.article, anchor_map)
        if result:
            (INDEXED_DIR / f"{args.article}.txt").write_text(result, encoding="utf-8")
            print(f"Resolved: {args.article}")
            for u in unresolved:
                print(f"  UNRESOLVED: {u}")
        else:
            print(f"FAILED: {args.article}")

    elif args.all:
        total, total_unresolved = 0, 0
        for f in sorted(INDEXED_DIR.glob("*.txt")):
            result, unresolved = resolve_article(f.stem, anchor_map)
            if result:
                (INDEXED_DIR / f"{f.name}").write_text(result, encoding="utf-8")
                total += 1
            if unresolved:
                total_unresolved += len(unresolved)
                for u in unresolved:
                    print(f"  UNRESOLVED [{f.stem}]: {u}")
        print(f"Resolved {total}, {total_unresolved} unresolved")


if __name__ == "__main__":
    main()
