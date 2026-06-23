"""
Pass 1: Scope 标注 — 批处理脚本。
读取 build_index.py 预构建的 indexed TXT，发送给 LLM。

用法:
  python run_pass1.py                    # 处理全部 741 篇文章
  python run_pass1.py --article LimOp    # 单篇测试
  python run_pass1.py --limit 10         # 只处理前 10 篇
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
INDEXED_DIR = BASE_DIR / "output" / "indexed"
OUTPUT_DIR = BASE_DIR / "output"
CONFIG_FILE = PROJECT_DIR / "config.json"
PROMPT_FILE = BASE_DIR / "prompt.md"


def load_config():
    if not CONFIG_FILE.exists():
        print(f"ERROR: {CONFIG_FILE} not found. Copy config.example.json → config.json and fill in your API key.")
        sys.exit(1)
    return json.loads(CONFIG_FILE.read_text(encoding="utf-8"))


def load_prompt():
    return PROMPT_FILE.read_text(encoding="utf-8")


# ── LLM 调用 ─────────────────────────────────────

def call_llm(system_prompt: str, user_message: str, config: dict) -> dict | None:
    """
    调用 LLM API（兼容 OpenAI 格式）。
    返回解析后的 JSON，失败返回 None。
    """
    import requests  # 延迟导入，方便环境检查

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
        "max_tokens": config.get("max_tokens", 4096),
        "temperature": config.get("temperature", 0.1),
        "response_format": {"type": "json_object"},
    }

    base_url = config.get("base_url", "https://api.deepseek.com/v1").rstrip("/")

    for attempt in range(3):
        try:
            resp = requests.post(
                f"{base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=120,
            )
            if resp.status_code == 200:
                body = resp.json()
                content = body["choices"][0]["message"]["content"]
                # DeepSeek JSON mode: content 应该是 JSON 字符串
                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    if "```json" in content:
                        content = content.split("```json")[1].split("```")[0]
                        return json.loads(content)
                    if "```" in content:
                        content = content.split("```")[1].split("```")[0]
                        return json.loads(content)
                    # 保存原始响应用于调试
                    debug_path = BASE_DIR / "output" / "_debug_last_fail.txt"
                    debug_path.parent.mkdir(parents=True, exist_ok=True)
                    debug_path.write_text(content, encoding="utf-8")
                    return None
            else:
                if attempt < 2:
                    time.sleep(5 * (attempt + 1))
        except Exception as e:
            if attempt < 2:
                time.sleep(5 * (attempt + 1))
    return None


# ── 校验 ─────────────────────────────────────────

def validate_output(output: dict, article_name: str) -> list[str]:
    """校验 LLM 输出，返回错误列表。"""
    errors = []

    if not isinstance(output, dict):
        return ["output is not a JSON object"]

    if output.get("article_name") != article_name:
        errors.append(f"article_name mismatch: {output.get('article_name')} vs {article_name}")

    scopes = output.get("scopes")
    if not isinstance(scopes, list) or len(scopes) == 0:
        errors.append("missing or empty 'scopes' array")
    else:
        valid_kinds = {"description", "reductio", "cases", "conditional", "let_bind"}
        scope_ids = set()
        for s in scopes:
            sid = s.get("scope_id", "")
            if sid in scope_ids:
                errors.append(f"duplicate scope_id: {sid}")
            scope_ids.add(sid)
            if s.get("scope_kind") not in valid_kinds:
                errors.append(f"scope {sid}: invalid scope_kind '{s.get('scope_kind')}'")
            # 必须有 clause_range 或 clause_ranges（root scope 豁免）
            if "clause_range" not in s and "clause_ranges" not in s and s.get("parent_scope") is not None:
                errors.append(f"scope {sid}: missing clause_range or clause_ranges")
            if "block_indices" not in s:
                errors.append(f"scope {sid}: missing block_indices")

        # 检查 parent_scope / child_scopes 引用完整性
        for s in scopes:
            parent = s.get("parent_scope")
            if parent and parent not in scope_ids:
                errors.append(f"scope {s['scope_id']}: parent_scope '{parent}' not found")
            for child in s.get("child_scopes", []):
                if child not in scope_ids:
                    errors.append(f"scope {s['scope_id']}: child_scope '{child}' not found")

    scope_relations = output.get("scope_relations", [])
    if not isinstance(scope_relations, list):
        errors.append("'scope_relations' must be an array")

    return errors


# ── Main ─────────────────────────────────────────

def process_article(txt_path: Path, config: dict, system_prompt: str) -> dict | None:
    """处理单篇文章，返回 LLM 输出或 None。"""
    user_msg = txt_path.read_text(encoding="utf-8")
    article_name = txt_path.stem

    result = call_llm(system_prompt, user_msg, config)

    if result is None:
        return None

    # 后处理：裁剪过长的 child_scopes（LLM 常见的幻觉模式）
    scopes = result.get("scopes", [])
    scope_ids = {s["scope_id"] for s in scopes}
    for s in scopes:
        children = s.get("child_scopes", [])
        if len(children) > 50 or any(c not in scope_ids for c in children):
            s["child_scopes"] = [c for c in children if c in scope_ids]

    errors = validate_output(result, article_name)
    if errors:
        result["_validation_errors"] = errors
    return result


def main():
    parser = argparse.ArgumentParser(description="Pass 1: Scope annotation")
    parser.add_argument("--article", type=str, help="Process single article by name")
    parser.add_argument("--limit", type=int, help="Process only first N articles")
    args = parser.parse_args()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # 收集文章列表（读取预构建的 indexed TXT）
    if args.article:
        articles = [INDEXED_DIR / f"{args.article}.txt"]
    else:
        articles = sorted(INDEXED_DIR.glob("*.txt"))
        if args.limit:
            articles = articles[:args.limit]

    total = len(articles)

    # ── LLM 模式 ──
    config = load_config()
    system_prompt = load_prompt()

    print(f"Pass 1: Scope annotation — {total} articles")
    print(f"Model: {config.get('model')}, Base URL: {config.get('base_url')}")
    print(f"Output: {OUTPUT_DIR}")
    print(f"{'='*60}")

    success = 0
    fail = 0
    times: list[float] = []
    t_start = time.time()

    for i, path in enumerate(articles):
        name = path.stem
        done = i + 1

        if i > 0 and i % 10 == 0:
            elapsed = time.time() - t_start
            avg = sum(times) / len(times)
            eta = avg * (total - done)
            print(f"[{done}/{total}] OK:{success} FAIL:{fail} | elapsed {elapsed/60:.0f}m | ETA {eta/60:.0f}m | now: {name}")

        if not path.exists():
            fail += 1
            continue

        t0 = time.time()
        result = process_article(path, config, system_prompt)
        times.append(time.time() - t0)

        if result:
            out_path = OUTPUT_DIR / f"{name}.json"
            out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
            success += 1
        else:
            fail += 1

        if i < total - 1:
            time.sleep(0.3)

    print(f"\n{'='*60}")
    total_time = time.time() - t_start
    print(f"Done. Success: {success}, Failed: {fail}. Total time: {total_time/60:.0f}m")


if __name__ == "__main__":
    main()
