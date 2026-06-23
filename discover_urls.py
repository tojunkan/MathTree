"""
Step 1: URL Discovery — 从小时百科目录页提取数学文章 URL 清单。

输入：https://wuli.wiki/online/（目录页）
输出：data/wuliwiki_urls.json
"""

import json
import time
import re
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests
from bs4 import BeautifulSoup

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_FILE = DATA_DIR / "wuliwiki_urls.json"
TOC_URL = "https://wuli.wiki/online/"

# ── 数学 Part 编号 ────────────────────────────────────────────
# Part 1: 科普 ❌ | Part 2: 高中数学 ✅ | Part 3: 高中物理 ❌
# Part 4-22: 全部数学 ✅ | Part 23-39: 物理/计算机/考研/附录 ❌
MATH_PARTS = {2} | set(range(4, 23))  # {2, 4, 5, ..., 22}

# Part 编号 → 中文名映射（从 h2 文本解析）
# 用于输出时标注


def fetch_toc(session: requests.Session) -> str:
    """拉取目录页 HTML。"""
    print(f"Fetching {TOC_URL} ...")
    resp = session.get(TOC_URL, timeout=30)
    resp.encoding = "utf-8"
    resp.raise_for_status()
    print(f"  OK: {len(resp.text):,} bytes")
    return resp.text


def parse_part_id(part_id_str: str) -> int | None:
    """从 'part5' 提取数字 5。"""
    m = re.search(r"part(\d+)", part_id_str)
    return int(m.group(1)) if m else None


def parse_part_name(h2_text: str) -> str:
    """从 '第五部分 一元微积分' 提取 '5_一元微积分'。"""
    # 中文数字 → 阿拉伯数字
    CN_NUM = {
        "一": 1, "二": 2, "三": 3, "四": 4, "五": 5,
        "六": 6, "七": 7, "八": 8, "九": 9, "十": 10,
        "十一": 11, "十二": 12, "十三": 13, "十四": 14,
        "十五": 15, "十六": 16, "十七": 17, "十八": 18,
        "十九": 19, "二十": 20, "二十一": 21, "二十二": 22,
        "二十三": 23, "二十四": 24, "二十五": 25, "二十六": 26,
        "二十七": 27, "二十八": 28, "二十九": 29, "三十": 30,
        "三十一": 31, "三十二": 32, "三十三": 33, "三十四": 34,
        "三十五": 35, "三十六": 36, "三十七": 37, "三十八": 38,
        "三十九": 39,
    }
    m = re.match(r"第([一二三四五六七八九十]+)部分\s*(.*)", h2_text)
    if m:
        num = CN_NUM.get(m.group(1), 0)
        name = m.group(2).strip()
        return f"{num}_{name}"
    return h2_text


def parse_toc(html: str) -> dict:
    """解析目录页，按 Part → Chapter → Article 层级提取。"""
    soup = BeautifulSoup(html, "lxml")

    # 找到所有 teal 色的 Part 标题容器
    part_headers = soup.find_all("div", class_="w3-teal")
    print(f"Found {len(part_headers)} part headers")

    all_articles = []
    parts_summary = {}
    stats = {"total_articles": 0, "math_articles": 0, "draft_skipped": 0, "by_type": {}}

    for ph in part_headers:
        h2 = ph.find("h2")
        if not h2:
            continue
        part_id = h2.get("id", "")
        part_num = parse_part_id(part_id)
        part_name = parse_part_name(h2.get_text(strip=True))

        if part_num is None:
            continue

        is_math = part_num in MATH_PARTS
        print(f"\n  Part {part_num}: {part_name} — {'✅ MATH' if is_math else '❌ skip'}")

        # 找到紧随其后的内容 div
        content_div = ph.find_next_sibling("div", class_="w3-container")
        if not content_div:
            print(f"    WARNING: no content div found")
            continue

        # 在内容 div 中遍历 h3（章节）和 p.toc（文章链接）
        chapter = "前言"  # default chapter before first h3
        part_articles = []

        for elem in content_div.children:
            if not hasattr(elem, "name"):
                continue

            if elem.name == "h3":
                chapter = elem.get_text(strip=True)
                # 清理分隔符
                chapter = chapter.replace("\n", "").strip()

            elif elem.name == "p" and "toc" in (elem.get("class") or []):
                for a in elem.find_all("a", href=True):
                    href = a["href"]
                    if not href.endswith(".html"):
                        continue
                    classes = a.get("class", [])
                    text = a.get_text(strip=True)

                    # 从 URL 提取文章名（去掉路径和扩展名）
                    article_name = href.rsplit("/", 1)[-1].replace(".html", "")

                    # 跳过非 wuli.wiki 链接
                    if "wuli.wiki" not in href:
                        continue

                    is_draft = "draft" in classes
                    article_type = "Tutor"  # default
                    for t in ("Tutor", "Wiki", "Note", "Art", "Map", "Sum"):
                        if t in classes:
                            article_type = t
                            break

                    article = {
                        "name": article_name,
                        "title": text,
                        "url": href,
                        "type": article_type,
                        "draft": is_draft,
                        "part": part_name,
                        "part_num": part_num,
                        "chapter": chapter,
                    }
                    all_articles.append(article)

                    if is_math and not is_draft:
                        part_articles.append(article)
                        stats["math_articles"] += 1
                    elif is_draft:
                        stats["draft_skipped"] += 1

                    stats["total_articles"] += 1
                    stats["by_type"][article_type] = stats["by_type"].get(article_type, 0) + 1

        if is_math and part_articles:
            parts_summary[part_name] = {
                "part_num": part_num,
                "article_count": len(part_articles),
                "articles": part_articles,
            }

    return {
        "all_articles": all_articles,
        "parts_summary": parts_summary,
        "stats": stats,
    }


def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    session = requests.Session()
    session.headers.update({
        "User-Agent": "MathTreeBot/1.0 (math knowledge graph project; educational use)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    })

    # 拉取
    html = fetch_toc(session)

    # 解析
    result = parse_toc(html)
    stats = result["stats"]

    print(f"\n{'='*60}")
    print(f"  Total articles on page:  {stats['total_articles']}")
    print(f"  Math articles (non-draft): {stats['math_articles']}")
    print(f"  Drafts skipped:           {stats['draft_skipped']}")
    print(f"  By type: {stats['by_type']}")
    print(f"  Math parts: {len(result['parts_summary'])}")
    for pname, pinfo in result["parts_summary"].items():
        print(f"    {pname}: {pinfo['article_count']} articles")

    # 扁平化数学文章列表（用于爬虫）
    math_articles = []
    for pname, pinfo in result["parts_summary"].items():
        math_articles.extend(pinfo["articles"])

    tz = timezone(timedelta(hours=8))  # CST
    output = {
        "source": TOC_URL,
        "scraped_at": datetime.now(tz).isoformat(),
        "total_on_page": stats["total_articles"],
        "math_articles_count": len(math_articles),
        "draft_skipped": stats["draft_skipped"],
        "stats_by_type": stats["by_type"],
        "math_parts": sorted(result["parts_summary"].keys()),
        "articles": math_articles,
    }

    OUTPUT_FILE.write_text(json.dumps(output, ensure_ascii=False, indent=2))
    print(f"\nSaved {len(math_articles)} math article URLs to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
