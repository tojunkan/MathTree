"""
将 Pass 1 Scope 标注注入 indexed TXT，生成增强版 TXT。
Pass 2 只需读这一个文件。
"""

import json
import re
import sys
from pathlib import Path

BASE_DIR = Path(__file__).parent
PASS1_DIR = BASE_DIR.parent / "pass1_scope" / "output"
INDEXED_DIR = PASS1_DIR / "indexed"
ENHANCED_DIR = BASE_DIR / "output" / "enhanced"


def enhance(article_name: str) -> str | None:
    pass1_path = PASS1_DIR / f"{article_name}.json"
    indexed_path = INDEXED_DIR / f"{article_name}.txt"

    if not pass1_path.exists() or not indexed_path.exists():
        return None

    pass1 = json.loads(pass1_path.read_text(encoding="utf-8"))
    text = indexed_path.read_text(encoding="utf-8")

    scopes = pass1.get("scopes", [])
    if not scopes:
        return text  # 没有 Scope 就直接返回原文

    # 按 clause_range 的起始位置排序，从大到小，方便从后往前插入标签
    # 先收集非 root 的 scope（有 clause_range 的）
    tagged = []
    for s in scopes:
        cr = s.get("clause_range")
        if cr is None:
            continue
        tagged.append({
            "start": cr[0],
            "end": cr[1],
            "scope_id": s["scope_id"],
            "kind": s.get("scope_kind", "description"),
            "label": s.get("label", ""),
        })

    # 按 start 升序，同 start 按 end 降序（外层先闭合）
    tagged.sort(key=lambda x: (x["start"], -x["end"]))

    # 构建嵌套结构：子 scope 完全在父 scope 内的，自动成为父子
    # 为每个 scope 找到直接父 scope
    for t in tagged:
        t["children"] = []

    for i, t in enumerate(tagged):
        # 找到最小的包含此 scope 的 scope
        parent = None
        for j, other in enumerate(tagged):
            if i == j:
                continue
            if other["start"] <= t["start"] and other["end"] >= t["end"]:
                if parent is None or (other["start"] <= parent["start"] and other["end"] >= parent["end"]):
                    parent = other
        t["parent"] = parent
        if parent:
            parent["children"].append(t)

    # 从大到小排，方便从后往前插入闭合标签
    tagged.sort(key=lambda x: (-x["start"], x["end"]))

    # 在文本中插入 scope 标签
    lines = text.split("\n")
    # 找出每行的子句索引
    clause_pattern = re.compile(r"^\[(\d+)\] ")

    class ClauseInfo:
        def __init__(self, idx: int, line_no: int):
            self.idx = idx
            self.line_no = line_no

    clause_lines: dict[int, int] = {}  # clause_index → line_number
    for li, line in enumerate(lines):
        m = clause_pattern.match(line)
        if m:
            clause_lines[int(m.group(1))] = li

    # 为每个 scope 找到插入位置（第一个子句的行号、最后一个子句的下一个行号）
    inserts: list[tuple[int, str]] = []  # (line_number, tag_line)
    for t in tagged:
        start_line = clause_lines.get(t["start"])
        end_line = clause_lines.get(t["end"])
        if start_line is None:
            continue
        # 开标签
        opens = f"[SCOPE:{t['scope_id']}|{t['kind']}"
        if t["label"]:
            opens += f"|{t['label']}"
        opens += "]"
        inserts.append((start_line, opens))
        # 闭标签：在下一个子句开始前插入（避免切到多行子句中间）
        if end_line is not None:
            # 找 end+1 子句的起始行，在其前插入闭合标签
            next_start = clause_lines.get(t["end"] + 1)
            if next_start is not None:
                inserts.append((next_start, f"[/SCOPE:{t['scope_id']}]"))
            else:
                # 没有下一个子句，在最后插入
                inserts.append((len(lines), f"[/SCOPE:{t['scope_id']}]"))

    # 按行号降序插入
    inserts.sort(key=lambda x: -x[0])
    for line_no, tag_line in inserts:
        if 0 <= line_no <= len(lines):
            lines.insert(line_no, tag_line)

    # 在开头加 root scope
    root = next((s for s in scopes if s.get("parent_scope") is None), None)
    if root:
        root_tag = f"[SCOPE:{root['scope_id']}|{root.get('scope_kind','description')}"
        if root.get("label"):
            root_tag += f"|{root['label']}"
        root_tag += "]"
        lines.insert(0, root_tag)
        lines.append(f"[/SCOPE:{root['scope_id']}]")

    # scope_relations 保留在末尾
    scope_relations = pass1.get("scope_relations", [])
    if scope_relations:
        lines.append("\n## Scope 间关系")
        lines.append(json.dumps(scope_relations, ensure_ascii=False, indent=2))

    # 移除 block 标题行和冗余元数据
    text = "\n".join(lines)
    text = re.sub(r"^## Block \d+:.*?（索引 \d+）\n", "", text, flags=re.MULTILINE)
    text = re.sub(r"^正文（\d+ 个 block.*?）:\n", "", text, flags=re.MULTILINE)
    text = re.sub(r"\n{3,}", "\n\n", text)

    # 二次分句："若...则..." 等切开
    text = _refine_clauses(text)

    return text


def _refine_clauses(text: str) -> str:
    """精分子句：切\"若…则…\"、切多点并列 (a)(b)(c) 等。"""
    lines = text.split("\n")
    result = []
    clause_re = re.compile(r"^\[(\d+)\]\s(.+)")
    # "若/如果/当...则/那么/故..."
    split_re = re.compile(r"(.*?)(?:^|[，。；])((?:若|如果|倘若|假如|当).+?)，?(?:则|那么|故|因此|所以|于是|从而|即|就)(.+)")
    # 多点并列: (a)...(b)...（全/半角括号）或 (i)...(ii)...
    subpoint_re = re.compile(r"([（\(][a-z][）\)]|[（\(]i+v?[）\)])\s?")

    for line in lines:
        m = clause_re.match(line)
        if not m:
            result.append(line)
            continue
        idx = m.group(1)
        text_content = m.group(2)

        # 先剥前导子点标记（如"（g）"），试"若…则…"，再加回标记
        sub_prefix = ""
        pm = re.match(r"^([（\(][a-z][）\)])\s?", text_content)
        if pm:
            sub_prefix = pm.group(1)
            stripped = text_content[pm.end():]
        else:
            stripped = text_content

        sm = split_re.match(stripped)
        if sm:
            before = sm.group(1).strip()
            condition = sm.group(2).strip()
            conclusion = sm.group(3).strip()
            if before:
                result.append(f"[{idx}a] {sub_prefix}{before}")
                result.append(f"[{idx}b] {condition}，则{conclusion}")
            else:
                result.append(f"[{idx}a] {sub_prefix}{condition}")
                result.append(f"[{idx}b] 则{conclusion}")
            continue

        # 再试多点并列：找第二个及之后的子点标记，切开
        pts = list(subpoint_re.finditer(text_content))
        if len(pts) >= 2:
            sub_labels = "abcdefghijklmnopqrstuvwxyz"
            parts = []
            for pi, pt in enumerate(pts):
                start = pt.start()
                end = pts[pi + 1].start() if pi + 1 < len(pts) else len(text_content)
                parts.append(text_content[start:end].strip())
            if len(parts) >= 2:
                for pi, part in enumerate(parts):
                    label = sub_labels[pi] if pi < 26 else str(pi)
                    result.append(f"[{idx}{label}] {part}")
                continue

        result.append(line)

    return "\n".join(result)


def main():
    parser = __import__("argparse").ArgumentParser(description="Enhance indexed TXT with Pass 1 scope info")
    parser.add_argument("--article", type=str)
    parser.add_argument("--all", action="store_true")
    args = parser.parse_args()

    ENHANCED_DIR.mkdir(parents=True, exist_ok=True)

    if args.article:
        result = enhance(args.article)
        if result:
            (ENHANCED_DIR / f"{args.article}.txt").write_text(result, encoding="utf-8")
            print(f"Enhanced: {args.article}")
        else:
            print(f"FAILED: {args.article}")
    elif args.all:
        total = 0
        for f in sorted(PASS1_DIR.glob("*.json")):
            if f.stem.startswith("_"):
                continue
            result = enhance(f.stem)
            if result:
                (ENHANCED_DIR / f"{f.stem}.txt").write_text(result, encoding="utf-8")
                total += 1
        print(f"Enhanced {total} articles")
    else:
        print("Use --article X or --all")


if __name__ == "__main__":
    main()
