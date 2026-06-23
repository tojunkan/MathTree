"""
Step 2: HTML 爬取（带 Checkpoint）— 下载小时百科数学文章 HTML。

输入：data/wuliwiki_urls.json
输出：data/wuliwiki_raw/*.html + data/wuliwiki_checkpoint.json

特性：
- 断点续爬：启动时加载 checkpoint，跳过已完成的文章
- 原子写入：checkpoint 先写 .tmp 再 os.replace()
- 指数退避重试：最多 3 次（2s → 4s → 8s）
- 速率控制：1-2s 间隔 + 随机抖动
"""

import json
import os
import random
import time
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
URLS_FILE = DATA_DIR / "wuliwiki_urls.json"
CHECKPOINT_FILE = DATA_DIR / "wuliwiki_checkpoint.json"
RAW_DIR = DATA_DIR / "wuliwiki_raw"

# ── 配置 ──────────────────────────────────────────────────────
MIN_DELAY = 1.0       # 最小请求间隔（秒）
MAX_DELAY = 2.0       # 最大请求间隔（秒）
TIMEOUT = 30          # HTTP 超时（秒）
MAX_RETRIES = 3       # 每篇文章最多重试次数
RETRY_BACKOFF = [2, 4, 8]  # 重试等待秒数


def tz_now() -> str:
    """返回 CST 时区的 ISO 时间字符串。"""
    return datetime.now(timezone(timedelta(hours=8))).isoformat()


def load_urls() -> list[dict]:
    """加载 URL 清单（只取 math articles）。"""
    if not URLS_FILE.exists():
        print(f"ERROR: {URLS_FILE} not found. Run discover_urls.py first.")
        sys.exit(1)
    data = json.loads(URLS_FILE.read_text(encoding="utf-8"))
    articles = data.get("articles", [])
    print(f"Loaded {len(articles)} articles from {URLS_FILE}")
    return articles


def load_checkpoint() -> dict:
    """加载 checkpoint，如不存在则返回空模板。"""
    if CHECKPOINT_FILE.exists():
        try:
            cp = json.loads(CHECKPOINT_FILE.read_text(encoding="utf-8"))
            print(f"Checkpoint loaded: {cp['stats']['crawl_done']} done, "
                  f"{cp['stats']['crawl_failed']} failed, "
                  f"{cp['stats']['crawl_pending']} pending")
            return cp
        except (json.JSONDecodeError, KeyError) as e:
            print(f"WARNING: Corrupt checkpoint ({e}), starting fresh")
    return None


def init_checkpoint(articles: list[dict]) -> dict:
    """从文章列表初始化新的 checkpoint。"""
    cp = {
        "started_at": tz_now(),
        "updated_at": tz_now(),
        "articles": {},
        "stats": {
            "crawl_done": 0,
            "crawl_failed": 0,
            "crawl_pending": len(articles),
        },
    }
    for a in articles:
        cp["articles"][a["name"]] = {
            "status": "pending",
            "retries": 0,
            "last_error": None,
            "html_size": None,
            "crawled_at": None,
            # extract fields (for step 3)
            "extract_status": "pending",
            "extract_error": None,
            "extracted_at": None,
        }
    return cp


def save_checkpoint(cp: dict):
    """原子写入 checkpoint。"""
    cp["updated_at"] = tz_now()
    tmp_file = CHECKPOINT_FILE.with_suffix(".json.tmp")
    tmp_file.write_text(json.dumps(cp, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(tmp_file, CHECKPOINT_FILE)


def crawl_article(session: requests.Session, article: dict, cp: dict) -> bool:
    """爬取单篇文章，返回 True 表示成功，False 表示失败。"""
    name = article["name"]
    url = article["url"]
    entry = cp["articles"][name]

    try:
        resp = session.get(url, timeout=TIMEOUT)
        resp.encoding = "utf-8"
        resp.raise_for_status()

        # 检查是否得到了实际内容（非错误页）
        if len(resp.text) < 500:
            raise ValueError(f"Response too short ({len(resp.text)} bytes)")

        # 保存 HTML
        RAW_DIR.mkdir(parents=True, exist_ok=True)
        html_path = RAW_DIR / f"{name}.html"
        html_path.write_text(resp.text, encoding="utf-8")

        # 更新 checkpoint
        entry["status"] = "done"
        entry["html_size"] = len(resp.text)
        entry["crawled_at"] = tz_now()
        entry["last_error"] = None
        cp["stats"]["crawl_done"] += 1
        cp["stats"]["crawl_pending"] -= 1

        return True

    except Exception as e:
        entry["retries"] += 1
        entry["last_error"] = str(e)[:200]

        if entry["retries"] >= MAX_RETRIES:
            entry["status"] = "failed"
            cp["stats"]["crawl_failed"] += 1
            cp["stats"]["crawl_pending"] -= 1
        # else: stay at "pending" / retry next run

        return False


def main():
    RAW_DIR.mkdir(parents=True, exist_ok=True)

    # 加载文章列表和 checkpoint
    articles = load_urls()
    cp = load_checkpoint()

    if cp is None:
        cp = init_checkpoint(articles)
        save_checkpoint(cp)

    # 确保 checkpoint 中有所有文章（处理 URL 清单更新）
    existing = set(cp["articles"].keys())
    for a in articles:
        if a["name"] not in existing:
            cp["articles"][a["name"]] = {
                "status": "pending",
                "retries": 0,
                "last_error": None,
                "html_size": None,
                "crawled_at": None,
                "extract_status": "pending",
                "extract_error": None,
                "extracted_at": None,
            }
            cp["stats"]["crawl_pending"] += 1
    save_checkpoint(cp)

    # 创建 session
    session = requests.Session()
    session.headers.update({
        "User-Agent": "MathTreeBot/1.0 (math knowledge graph project; educational use)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    })

    # 构建待爬列表
    to_crawl = []
    for a in articles:
        entry = cp["articles"].get(a["name"])
        if entry is None:
            continue
        if entry["status"] in ("done", "failed"):
            continue
        to_crawl.append(a)

    total = len(to_crawl)
    if total == 0:
        print("All articles already crawled. Nothing to do.")
        return

    print(f"\nStarting crawl: {total} articles pending")
    print(f"Output: {RAW_DIR}")
    print(f"Rate: {MIN_DELAY}-{MAX_DELAY}s between requests")
    print(f"Retries: max {MAX_RETRIES} with backoff {RETRY_BACKOFF}")
    print(f"{'='*60}")

    success = 0
    fail = 0
    start_time = time.time()

    for i, article in enumerate(to_crawl):
        name = article["name"]
        url = article["url"]
        entry = cp["articles"][name]

        # 速率限制（在请求之前）
        if i > 0:
            delay = MIN_DELAY + random.random() * (MAX_DELAY - MIN_DELAY)
            time.sleep(delay)

        # 打印进度
        part = article.get("part", "?")
        eta = ""
        if i > 0 and success + fail > 0:
            elapsed = time.time() - start_time
            rate = (success + fail) / elapsed
            remaining = (total - i) / rate if rate > 0 else 0
            eta = f" | ETA {remaining/60:.1f}min"

        print(f"[{i+1:4d}/{total}] {name:<25s} {part:<30s}", end="", flush=True)

        ok = crawl_article(session, article, cp)

        if ok:
            success += 1
            size = entry["html_size"]
            print(f" OK ({size:>6d}B){eta}")
        else:
            fail += 1
            err = entry.get("last_error", "unknown")[:60]
            retries = entry.get("retries", 0)
            if entry["status"] == "failed":
                print(f" FAILED (after {retries} retries) {err}{eta}")
            else:
                retry_wait = RETRY_BACKOFF[min(retries - 1, len(RETRY_BACKOFF) - 1)]
                print(f" RETRY-{retries} (wait {retry_wait}s) {err}{eta}")
                # 重试等待（在下一轮请求之前）
                time.sleep(retry_wait)

        # 每 10 篇或最后 1 篇保存 checkpoint
        if (i + 1) % 10 == 0 or i == total - 1:
            save_checkpoint(cp)

    # 最终统计
    elapsed = time.time() - start_time
    print(f"\n{'='*60}")
    print(f"Crawl complete in {elapsed/60:.1f} min")
    print(f"  Success: {success}")
    print(f"  Failed:  {fail}")
    print(f"  Total:   {cp['stats']['crawl_done']} done, "
          f"{cp['stats']['crawl_failed']} failed, "
          f"{cp['stats']['crawl_pending']} pending")
    save_checkpoint(cp)


if __name__ == "__main__":
    main()
