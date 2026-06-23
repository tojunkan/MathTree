"""
DFS 遍历 proofwiki 分类树，收集所有页面 URL。
识别 (xC, xP) 标记判断子分类/页面数量。
叶节点打印 URL + 标题，按网站架构保存树状结构。
速率：3-5s/页。
"""
import json, time, re, sys
from pathlib import Path
from urllib.parse import urljoin
from DrissionPage import ChromiumPage, ChromiumOptions

BASE = "https://proofwiki.org"
COOKIE_FILE = Path(__file__).parent / "proofwiki_cookies.json"
OUTPUT_DIR = Path(__file__).parent / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

SEED_CATEGORIES = [
    "/wiki/Category:Axioms",
    "/wiki/Category:Definitions",
    "/wiki/Category:Proofs",
    "/wiki/Category:Symbols",
]

# State
seen_urls: set[str] = set()       # all visited URLs (categories + pages)
all_pages: dict[str, dict] = {}   # url -> {title, parent_category}
category_tree: dict = {}           # hierarchical structure
stats = {"cats": 0, "pages": 0, "leaves": 0}


def load_cookies(page: ChromiumPage):
    if COOKIE_FILE.exists():
        try:
            for c in json.loads(COOKIE_FILE.read_text()):
                page.set.cookies(c)
        except Exception:
            pass


def save_cookies(page: ChromiumPage):
    try:
        COOKIE_FILE.write_text(json.dumps(page.cookies()))
    except Exception:
        pass


def save_progress():
    data = {
        "collected_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "stats": stats,
        "pages": {url: info["title"] for url, info in all_pages.items()},
        "category_tree": category_tree,
    }
    (OUTPUT_DIR / "proofwiki_urls.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2))


def is_category_url(url: str) -> bool:
    return "/Category:" in url


def is_wiki_page(url: str) -> bool:
    return (
        "/wiki/" in url
        and "Category:" not in url
        and "Special:" not in url
        and "User:" not in url
        and "Talk:" not in url
        and "Help:" not in url
        and "ProofWiki:" not in url
        and "Book:" not in url
        and "Mathematician:" not in url
        and "index.php" not in url
        and "action=" not in url
    )


def parse_count(text: str) -> tuple[int, int]:
    """Parse '(3 C, 12 P)' or '(42 P)' notation. Returns (n_categories, n_pages)."""
    cats, pages = 0, 0
    m_c = re.search(r'\((\d+)\s*C', text)
    m_p = re.search(r'\((\d+)\s*P', text)
    if m_c:
        cats = int(m_c.group(1))
    if m_p:
        pages = int(m_p.group(1))
    return cats, pages


def crawl_category_page(page: ChromiumPage, url: str) -> tuple[list, list]:
    """
    Crawl ONE category page (including pagination).
    Returns (subcategory_links, page_links).
    Each subcategory_link: {url, title, n_cats, n_pages}
    Each page_link: {url, title}
    """
    subcats = []
    pages = []
    current_url = url

    while current_url:
        try:
            page.get(current_url)
            time.sleep(3)
        except Exception as e:
            print(f"      FETCH ERROR: {e}")
            time.sleep(5)
            break

        title = page.title
        if "Please wait" in title or "Just a moment" in title:
            print("      CF challenge, waiting 20s...")
            time.sleep(20)
            continue

        # Get subcategories + pages from their respective divs
        try:
            subcat_div = page.ele("#mw-subcategories")
            subcat_links = subcat_div.eles("tag:a") if subcat_div else []
            pages_div = page.ele("#mw-pages")
            page_links = pages_div.eles("tag:a") if pages_div else []
            links = subcat_links + page_links
        except Exception:
            links = []

        next_page_url = None
        for l in links:
            try:
                href = (l.attr("href") or "").split("#")[0]
                text = l.text.strip()
            except Exception:
                continue  # element lost during iteration
            if not text:
                continue

            full = urljoin(BASE, href) if href.startswith("/") else href

            # Pagination
            if text.lower() == "next page":
                next_page_url = full
                continue

            # Skip navigation junk
            if text in ("Jump to navigation", "Jump to search", "Category", "Read",
                         "Content Categories", "Edit preview settings", "Proof Index",
                         "Definition Index", "Symbol Index", "Axiom Index", "All Categories",
                         "Proofread Articles", "More Wanted Proofs", "Help Needed",
                         "Research Required", "Stub Articles", "Tidy Articles",
                         "Improvements Invited", "Refactoring", "Missing Links", "Maintenance"):
                continue

            # Parse category/page counts
            n_cats, n_pages = parse_count(text)

            if is_category_url(full):
                # Extract clean title (remove count suffix)
                clean = re.sub(r'\s*\(\d+\s*C.*?\)', '', text).strip()
                subcats.append({
                    "url": full,
                    "title": clean or text,
                    "n_cats": n_cats,
                    "n_pages": n_pages,
                })
            elif is_wiki_page(full):
                pages.append({"url": full, "title": text})

        current_url = next_page_url
        if next_page_url:
            time.sleep(2)

    return subcats, pages


def dfs_crawl(page: ChromiumPage, url: str, depth: int = 0):
    """DFS into category tree. Leaf categories print their pages."""
    if url in seen_urls:
        return {"url": url, "title": url.split("Category:")[-1] if "Category:" in url else url, "type": "seen"}

    seen_urls.add(url)
    prefix = "  " * depth
    short = url.split("/wiki/Category:")[-1][:60] if "/wiki/Category:" in url else url

    print(f"{prefix}[DFS d={depth}] {short}")

    subcats, pages = crawl_category_page(page, url)
    stats["cats"] += 1

    # Build tree node
    node = {
        "url": url,
        "title": page.title if hasattr(page, 'title') else short,
        "n_subcategories": len(subcats),
        "n_pages": len(pages),
        "children": [],
        "pages": [p["title"] for p in pages],
    }

    # Store pages
    for p in pages:
        if p["url"] not in all_pages:
            all_pages[p["url"]] = {"title": p["title"], "parent_category": url}
            stats["pages"] += 1
            # Print leaf pages
            print(f"{prefix}    📄 {p['title']}")

    if not subcats:
        # Leaf category
        stats["leaves"] += 1
        print(f"{prefix}  🍂 LEAF: {short} ({len(pages)} pages)")

    # DFS: recurse into each subcategory (depth-first)
    for sc in subcats:
        if sc["url"] not in seen_urls:
            time.sleep(1.5)  # gentle between DFS branches
            child = dfs_crawl(page, sc["url"], depth + 1)
            node["children"].append(child)

    return node


def main():
    co = ChromiumOptions()
    co.set_argument("--disable-blink-features=AutomationControlled")
    page = ChromiumPage(co)
    load_cookies(page)

    print("=== ProofWiki DFS Crawler ===\n")

    for i, seed in enumerate(SEED_CATEGORIES):
        full_url = f"{BASE}{seed}"
        name = seed.split("Category:")[-1]
        print(f"\n{'='*50}")
        print(f"Seed [{i+1}/{len(SEED_CATEGORIES)}]: {name}")
        print(f"{'='*50}")

        node = dfs_crawl(page, full_url, depth=0)
        category_tree[name] = node

        # Save after each seed
        save_cookies(page)
        save_progress()
        print(f"  >> Progress saved ({stats['pages']} pages)")

    # Final save
    save_cookies(page)
    save_progress()

    print(f"\n{'='*50}")
    print(f"DONE!")
    print(f"  Categories visited: {stats['cats']}")
    print(f"  Pages found:        {stats['pages']}")
    print(f"  Leaf categories:    {stats['leaves']}")
    print(f"  Output: {OUTPUT_DIR / 'proofwiki_urls.json'}")

    page.quit()


if __name__ == "__main__":
    main()
