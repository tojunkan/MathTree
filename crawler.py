"""
ProofWiki crawler — 提取数学定义、定理、证明的结构化内容。
使用 DrissionPage + 缓存的 cookies 绕过 reCAPTCHA。
"""
import json, time, re, os
from pathlib import Path
from DrissionPage import ChromiumPage, ChromiumOptions

BASE_DIR = Path(__file__).parent
COOKIE_FILE = BASE_DIR / "proofwiki_cookies.json"
OUTPUT_DIR = BASE_DIR / "data" / "proofwiki_pages"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# List of pages to crawl (can be expanded)
PAGES = [
    "Definition:Fourier_Series",
    "Fourier_Series",
    "Definition:Fourier_Coefficient",
    "Parseval's_Theorem",
    "Picard's_Existence_Theorem",
    "Definition:Continuous_Function",
    "Limit_of_Function",
    "Fundamental_Theorem_of_Calculus",
    "Definition:Riemann_Integral",
    "Taylor's_Theorem",
    "Cauchy_Sequence",
    "Definition:Equivalence_Relation",
    "Definition:Group",
    "Definition:Vector_Space",
    "Bolzano-Weierstrass_Theorem",
    "Heine-Borel_Theorem",
    "Definition:Metric_Space",
    "Definition:Topological_Space",
    "Definition:Convergence",
    "Banach_Fixed_Point_Theorem",
]


def load_cookies(page: ChromiumPage) -> bool:
    if not COOKIE_FILE.exists():
        return False
    try:
        cookies = json.loads(COOKIE_FILE.read_text())
        for c in cookies:
            page.set.cookies(c)
        return True
    except Exception:
        return False


def save_cookies(page: ChromiumPage):
    cookies = page.cookies()
    COOKIE_FILE.write_text(json.dumps(cookies))
    print(f"  Saved {len(cookies)} cookies")


def solve_recaptcha(page: ChromiumPage) -> bool:
    """Slow mouse click on reCAPTCHA checkbox."""
    for attempt in range(3):
        try:
            iframe = page.get_frame(1)  # reCAPTCHA iframe
            if not iframe:
                time.sleep(3)
                continue
            checkbox = iframe.ele("#recaptcha-anchor", timeout=3)
            if not checkbox:
                time.sleep(3)
                continue
            print("  Clicking reCAPTCHA with slow mouse...")
            page.actions.move_to(checkbox, duration=4)
            time.sleep(0.8)
            checkbox.click()
            time.sleep(5)
            return True
        except Exception as e:
            print(f"  reCAPTCHA attempt {attempt+1} failed: {e}")
            time.sleep(3)
    return False


def wait_for_page(page: ChromiumPage, keyword: str = "Definition", timeout: int = 60) -> bool:
    """Wait for CF/reCAPTCHA to pass and page to load."""
    for i in range(timeout):
        time.sleep(1)
        try:
            title = page.title
            if keyword.lower() in title.lower():
                return True
            # Check if we hit the challenge page
            body_text = ""
            try:
                body = page.ele("tag:body")
                if body:
                    body_text = body.text[:200]
            except Exception:
                pass
            if "安全验证" in body_text or "Verify you are human" in body_text:
                if i == 3:  # Try to solve after 3s
                    solve_recaptcha(page)
                continue
            # If we got the actual content page
            if body_text and ("ProofWiki" in body_text or keyword in body_text):
                return True
        except Exception:
            if i % 10 == 0:
                print(f"  Waiting... {i}s")
    return False


def extract_page_content(page: ChromiumPage) -> dict:
    """Extract structured content from a ProofWiki page."""
    try:
        body = page.ele("tag:body")
        raw_text = body.text if body else ""
    except Exception:
        raw_text = ""

    # Extract sections
    sections = {}
    current_section = "preamble"
    sections[current_section] = []

    lines = raw_text.split("\n")
    for line in lines:
        line = line.strip()
        if not line:
            continue
        # Detect section headers (ProofWiki uses single-word section names)
        if re.match(r"^(Definition|Theorem|Proof|Lemma|Corollary|Proposition|Example|Note|Remark|Also see|Sources?|Historical Note)$", line, re.I):
            current_section = line
            sections[current_section] = []
        else:
            sections[current_section].append(line)

    # Get HTML with MathML
    try:
        content_div = page.ele("#content") or page.ele(".mw-body") or page.ele("#bodyContent")
        html = content_div.html if content_div else ""
    except Exception:
        html = ""

    return {
        "title": page.title,
        "url": page.url,
        "raw_text": raw_text,
        "sections": {k: " ".join(v) for k, v in sections.items() if v},
        "html_snippet": html[:10000],
    }


def crawl_page(page: ChromiumPage, page_name: str) -> dict | None:
    url = f"https://proofwiki.org/wiki/{page_name}"
    print(f"\n[{page_name}]")
    print(f"  URL: {url}")

    page.get(url)

    if not wait_for_page(page, timeout=60):
        print(f"  FAILED: Could not load page (title={page.title})")
        return None

    print(f"  Loaded: {page.title}")

    # Extract content
    data = extract_page_content(page)

    # Save raw data
    safe_name = page_name.replace("/", "_").replace(":", "_").replace("'", "")
    output_file = OUTPUT_DIR / f"{safe_name}.json"
    output_file.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    print(f"  Saved to {output_file}")

    # Save cookies after each successful fetch
    save_cookies(page)

    return data


def main():
    print(f"ProofWiki Crawler")
    print(f"Pages to crawl: {len(PAGES)}")
    print(f"Output: {OUTPUT_DIR}")

    co = ChromiumOptions()
    co.set_argument("--disable-blink-features=AutomationControlled")
    co.set_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

    page = ChromiumPage(co)

    # Load existing cookies
    if load_cookies(page):
        print("Loaded saved cookies")

    results = {}
    for i, page_name in enumerate(PAGES):
        try:
            data = crawl_page(page, page_name)
            if data:
                results[page_name] = {"title": data["title"], "url": data["url"]}
            # Rate limiting
            time.sleep(2)
        except Exception as e:
            print(f"  ERROR: {e}")

    # Summary
    print(f"\n{'='*50}")
    print(f"Crawl complete: {len(results)}/{len(PAGES)} pages")
    for name, info in results.items():
        print(f"  {name} → {info['title']}")

    page.quit()


if __name__ == "__main__":
    main()
