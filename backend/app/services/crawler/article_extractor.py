import re
import datetime
from typing import Optional, Dict, Any
from bs4 import BeautifulSoup
import trafilatura
from app.utils.logger import logger


def clean_text(text: str) -> str:
    """
    Clean extracted text:
    - Normalize whitespace and line breaks
    - Remove duplicate consecutive paragraphs
    - Strip common web noise (e.g. 'baca juga', 'copyright', 'simak video', 'editor:')
    """
    if not text:
        return ""

    lines = [line.strip() for line in text.splitlines() if line.strip()]
    cleaned_lines = []
    seen = set()

    noise_patterns = [
        r"^(baca\s+juga|simak\s+juga|lihat\s+juga|tonton\s+juga):?.*$",
        r"^(copyright|hak\s+cipta)\s+.*$",
        r"^(editor|penulis|reporter|kontributor|redaktur):.*$",
        r"^(advertisement|iklan|sponsor).*$",
        r"^\s*klik\s+di\s+sini.*$",
    ]
    compiled_noise = [re.compile(p, re.IGNORECASE) for p in noise_patterns]

    for line in lines:
        # Check noise patterns
        if any(cp.match(line) for cp in compiled_noise):
            continue

        # Skip short repetitive boilerplate lines
        line_lower = line.lower()
        if len(line) < 25 and line_lower in seen:
            continue

        seen.add(line_lower)
        cleaned_lines.append(line)

    return "\n\n".join(cleaned_lines)


def generate_excerpt(text: str, max_chars: int = 200) -> str:
    """Generate a clean 150-200 character summary excerpt without breaking mid-word."""
    if not text:
        return ""
    cleaned = " ".join(text.split())
    if len(cleaned) <= max_chars:
        return cleaned

    # Trim to max_chars and find last space
    trimmed = cleaned[:max_chars]
    last_space = trimmed.rfind(" ")
    if last_space > 50:
        return trimmed[:last_space] + "..."
    return trimmed + "..."


def clean_html_with_soup(html: str) -> Dict[str, Any]:
    """
    Robust fallback article extractor using BeautifulSoup:
    - Decomposes scripts, styles, navigations, footers, sidebars, ads, forms, iframes.
    - Extracts title (meta og:title or <title>), author, og:image, and cleaned text.
    """
    soup = BeautifulSoup(html, "html.parser")

    # Remove non-content elements
    unwanted_tags = [
        "script", "style", "nav", "footer", "header", "aside", "form",
        "iframe", "noscript", "svg", "button", "input", "figure", "figcaption", "menu"
    ]
    for tag in soup.find_all(unwanted_tags):
        tag.decompose()

    # Title extraction
    title = ""
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):
        title = og_title["content"].strip()
    elif soup.title and soup.title.string:
        title = soup.title.string.strip()

    # Author extraction
    author = ""
    meta_author = (
        soup.find("meta", attrs={"name": "author"}) or
        soup.find("meta", property="article:author") or
        soup.find("meta", attrs={"name": "byline"})
    )
    if meta_author and meta_author.get("content"):
        author = meta_author["content"].strip()

    # Image URL extraction
    image_url = ""
    og_image = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "twitter:image"})
    if og_image and og_image.get("content"):
        image_url = og_image["content"].strip()

    # Content extraction from article body or paragraphs
    article_tag = soup.find("article") or soup.find("main") or soup.find("div", class_=re.compile(r"content|entry|post|article|read", re.I))
    target = article_tag if article_tag else soup

    paragraphs = target.find_all("p")
    extracted_paragraphs = []
    for p in paragraphs:
        t = p.get_text().strip()
        if len(t) > 25:
            extracted_paragraphs.append(t)

    raw_text = "\n\n".join(extracted_paragraphs)
    content = clean_text(raw_text)
    excerpt = generate_excerpt(content)

    return {
        "title": title,
        "author": author,
        "content": content,
        "excerpt": excerpt,
        "image_url": image_url,
    }


def extract_article(html: str, url: str) -> Dict[str, Any]:
    """
    Extract article title, author, image, published date, cleaned text, and excerpt.
    Prefers trafilatura; falls back to BeautifulSoup if extraction fails or is too short.
    """
    if not html:
        return {
            "title": "",
            "author": "",
            "content": "",
            "excerpt": "",
            "image_url": "",
            "published_at": None,
        }

    try:
        # 1. Primary: Trafilatura
        extracted_text = trafilatura.extract(
            html,
            include_comments=False,
            include_tables=False,
            no_fallback=False,
            url=url,
            output_format="txt"
        )
        metadata = trafilatura.extract_metadata(html)

        if extracted_text and len(extracted_text.strip()) >= 100:
            title = metadata.title.strip() if metadata and metadata.title else ""
            author = metadata.author.strip() if metadata and metadata.author else ""
            image_url = metadata.image.strip() if metadata and metadata.image else ""
            published_at = None
            if metadata and metadata.date:
                try:
                    published_at = datetime.datetime.fromisoformat(metadata.date)
                except Exception:
                    published_at = None

            # If title is missing in trafilatura metadata, parse from HTML title tag
            if not title:
                soup = BeautifulSoup(html, "html.parser")
                title = soup.title.string.strip() if soup.title and soup.title.string else ""

            cleaned_content = clean_text(extracted_text)
            excerpt = generate_excerpt(cleaned_content)

            return {
                "title": title,
                "author": author,
                "content": cleaned_content,
                "excerpt": excerpt,
                "image_url": image_url,
                "published_at": published_at,
            }

    except Exception as e:
        logger.warning(f"[ArticleExtractor] Trafilatura failed for {url}: {e}. Trying fallback.")

    # 2. Fallback: BeautifulSoup
    return clean_html_with_soup(html)
