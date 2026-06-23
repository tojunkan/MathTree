"""
Pass 2: Statement 拆分 — 批处理脚本。
读取 Pass 1 输出 + indexed TXT，发送给 LLM。

用法:
  python run_pass2.py                    # 处理全部文章
  python run_pass2.py --article LimOp    # 单篇测试
  python run_pass2.py --limit 10         # 只处理前 10 篇
"""

import json
import os
import sys
import time
import argparse
from pathlib import Path

# ── 配置 ─────────────────────────────────────────

BASE_DIR = Path(__file__).parent
PROJECT_DIR = BASE_DIR.parent
ENHANCED_DIR = BASE_DIR / "output" / "enhanced"
OUTPUT_DIR = BASE_DIR / "output"
CONFIG_FILE = PROJECT_DIR / "config.json"
PROMPT_FILE = BASE_DIR / "prompt.md"


def load_config():
    if not CONFIG_FILE.exists():
        print(f"ERROR: {CONFIG_FILE} not found.")
        sys.exit(1)
    return json.loads(CONFIG_FILE.read_text(encoding="utf-8"))


def load_prompt():
    return PROMPT_FILE.read_text(encoding="utf-8")


# ── LLM 调用 ─────────────────────────────────────

def call_llm(system_prompt: str, user_message: str, config: dict) -> dict | None:
    import requests

    headers = {
        "Authorization": f"Bearer {config['api_key']}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": config.get("model", "deepseek-chat"),
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "max_tokens": config.get("max_tokens", 24576),
        "temperature": config.get("temperature", 0.1),
        "response_format": {"type": "json_object"},
    }

    base_url = config.get("base_url", "https://api.deepseek.com/v1").rstrip("/")

    for attempt in range(3):
        try:
            resp = requests.post(f"{base_url}/chat/completions", headers=headers, json=payload, timeout=120)
            if resp.status_code == 200:
                body = resp.json()
                content = body["choices"][0]["message"]["content"]
                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    if "```json" in content:
                        content = content.split("```json")[1].split("```")[0]
                        return json.loads(content)
                    if "```" in content:
                        content = content.split("```")[1].split("```")[0]
                        return json.loads(content)
                    debug_path = BASE_DIR / "output" / "_debug_last_fail.txt"
                    debug_path.parent.mkdir(parents=True, exist_ok=True)
                    debug_path.write_text(content, encoding="utf-8")
                    return None
            else:
                if attempt < 2:
                    time.sleep(5 * (attempt + 1))
        except Exception:
            if attempt < 2:
                time.sleep(5 * (attempt + 1))
    return None


# ── 构建用户消息 ─────────────────────────────────

def build_user_message(article_name: str) -> str | None:
    """读取增强版 TXT（已含 Scope 标注 + 精分子句）。"""
    enhanced_path = ENHANCED_DIR / f"{article_name}.txt"
    if not enhanced_path.exists():
        return None
    return enhanced_path.read_text(encoding="utf-8")


# ── 校验 ─────────────────────────────────────────

def validate_output(output: dict, article_name: str) -> list[str]:
    errors = []

    if not isinstance(output, dict):
        return ["output is not a JSON object"]

    if output.get("article_name") != article_name:
        errors.append(f"article_name mismatch: {output.get('article_name')} vs {article_name}")

    statements = output.get("statements", [])
    if not isinstance(statements, list):
        return ["missing or invalid 'statements' array"]

    valid_subtypes = {
        "definition", "axiom", "theorem", "lemma", "corollary",
        "assumption", "conclusion", "conjecture", "counterexample_claim",
        "condition", "question", "example", "exercise", "remark",
    }
    valid_edge_types = {
        "implies", "equivalent", "special_case", "counterexample_of",
        "case", "uses_idea", "hint",
    }

    stmt_ids = {s["stmt_id"] for s in statements if "stmt_id" in s}
    stmt_map = {s["stmt_id"]: s for s in statements if "stmt_id" in s}

    for s in statements:
        sid = s.get("stmt_id", "?")
        if s.get("subtype") not in valid_subtypes:
            errors.append(f"stmt {sid}: invalid subtype '{s.get('subtype')}'")

    # Statement 嵌套校验：子 Statement 的边不能泄露到父 Statement 外部
    def _contains(a: list, b: list) -> bool:
        """a 的 clause_range 是否完全包含 b"""
        return a[0] <= b[0] and a[1] >= b[1]

    def _find_parent(stmt_id: str) -> str | None:
        s = stmt_map.get(stmt_id)
        if not s or "clause_range" not in s:
            return None
        cr = s["clause_range"]
        for sid, other in stmt_map.items():
            if sid == stmt_id:
                continue
            ocr = other.get("clause_range")
            if ocr and _contains(ocr, cr) and ocr != cr:
                # other contains s — other is a parent candidate
                # find the tightest parent
                return sid
        return None

    for edge_list in [output.get("edges", []), output.get("cross_scope_edges", [])]:
        for e in edge_list:
            if e.get("edge_type") not in valid_edge_types:
                errors.append(f"edge: invalid edge_type '{e.get('edge_type')}'")
            src = e.get("source", "")
            tgt = e.get("target", "")
            if src not in stmt_ids:
                errors.append(f"edge: source '{src}' not found")
            if tgt not in stmt_ids:
                errors.append(f"edge: target '{tgt}' not found")
            # 嵌套泄露检查：如果 src 和 tgt 有不同的父 Statement，且都不是对方的父，报错
            if src in stmt_ids and tgt in stmt_ids:
                src_parent = _find_parent(src)
                tgt_parent = _find_parent(tgt)
                if src_parent and tgt_parent and src_parent != tgt_parent:
                    if src != tgt_parent and tgt != src_parent:
                        errors.append(f"edge {src}→{tgt}: crosses Statement nesting boundary ({src_parent} vs {tgt_parent})")

    return errors


# ── Main ─────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Pass 2: Statement annotation")
    parser.add_argument("--article", type=str, help="Process single article")
    parser.add_argument("--limit", type=int, help="Process first N articles")
    args = parser.parse_args()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    config = load_config()
    system_prompt = load_prompt()

    # 收集文章列表（以增强版 TXT 为准）
    if args.article:
        articles = [args.article]
    else:
        articles = sorted([p.stem for p in ENHANCED_DIR.glob("*.txt")])
        if args.limit:
            articles = articles[:args.limit]

    total = len(articles)
    print(f"Pass 2: Statement annotation — {total} articles")
    print(f"Model: {config.get('model')}")
    print(f"{'='*60}")

    success = 0
    fail = 0
    times: list[float] = []
    t_start = time.time()

    for i, name in enumerate(articles):
        done = i + 1
        if i > 0 and i % 10 == 0:
            elapsed = time.time() - t_start
            avg = sum(times) / len(times)
            eta = avg * (total - done)
            print(f"[{done}/{total}] OK:{success} FAIL:{fail} | elapsed {elapsed/60:.0f}m | ETA {eta/60:.0f}m | now: {name}")

        user_msg = build_user_message(name)
        if user_msg is None:
            print(f"  {name}: MISSING Pass 1 or indexed TXT")
            fail += 1
            continue

        # 最多重试 3 次
        result = None
        for attempt in range(3):
            t0 = time.time()
            result = call_llm(system_prompt, user_msg, config)
            times.append(time.time() - t0)

            if result is None:
                if attempt < 2:
                    time.sleep(3 * (attempt + 1))
                continue

            errors = validate_output(result, name)
            if errors:
                result["_validation_errors"] = errors
                if attempt < 2:
                    time.sleep(3 * (attempt + 1))
                continue

            # 成功
            break

        if result:
            out_path = OUTPUT_DIR / f"{name}.json"
            out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
            success += 1
        else:
            fail += 1

        if i < total - 1:
            time.sleep(0.3)

    print(f"\n{'='*60}")
    print(f"Done. Success: {success}, Failed: {fail}. Total: {total}")


if __name__ == "__main__":
    main()
