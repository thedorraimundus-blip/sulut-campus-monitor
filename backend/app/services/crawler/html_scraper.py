import datetime
from typing import Optional, Dict, Any
from bs4 import BeautifulSoup
import trafilatura
from app.utils.logger import logger


def clean_html_with_soup(html: str) -> Dict[str, Any]:
    """
    Fallback extractor using BeautifulSoup:
    Cleans nav, footer, ads, header, script, style, form, iframe, aside.
    Extracts title, meta author, og:image, and cleaned paragraph text.
    """
    soup = BeautifulSoup(html, "html.parser")

    # Remove unwanted tags
    unwanted_tags = [
        "script", "style", "nav", "footer", "header", "aside", "form",
        "iframe", "noscript", "svg", "button", "input"
    ]
    for tag in soup.find_all(unwanted_tags):
        tag.decompose()

    # Extract Title
    title = ""
    if soup.title and soup.title.string:
        title = soup.title.string.strip()
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):
        title = og_title["content"].strip()

    # Extract Author
    author = ""
    meta_author = soup.find("meta", attrs={"name": "author"}) or soup.find("meta", property="article:author")
    if meta_author and meta_author.get("content"):
        author = meta_author["content"].strip()

    # Extract Image URL
    image_url = ""
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        image_url = og_image["content"].strip()

    # Extract Text from paragraphs
    paragraphs = soup.find_all("p")
    content_lines = []
    for p in paragraphs:
        text = p.get_text().strip()
        if len(text) > 30 and not any(skip in text.lower() for skip in ["baca juga", "copyright", "hak cipta", "iklan"]):
            content_lines.append(text)

    content = "\n\n".join(content_lines)
    excerpt = content[:250] + "..." if len(content) > 250 else content

    return {
        "title": title,
        "author": author,
        "content": content,
        "excerpt": excerpt,
        "image_url": image_url,
    }


def extract_article_content(html: str, url: str) -> Dict[str, Any]:
    """
    Primary extractor using trafilatura with metadata extraction,
    falling back to BeautifulSoup if trafilatura output is sparse.
    """
    try:
        # Try trafilatura first
        extracted_text = trafilatura.extract(
            html,
            include_comments=False,
            include_tables=False,
            no_fallback=False,
            url=url
        )

        metadata = trafilatura.extract_metadata(html)

        if extracted_text and len(extracted_text.strip()) > 80:
            title = metadata.title if metadata and metadata.title else ""
            author = metadata.author if metadata and metadata.author else ""
            image_url = metadata.image if metadata and metadata.image else ""
            
            # If title is empty, grab from soup
            if not title:
                soup = BeautifulSoup(html, "html.parser")
                title = soup.title.string.strip() if soup.title else ""

            excerpt = extracted_text[:250] + "..." if len(extracted_text) > 250 else extracted_text

            return {
                "title": title,
                "author": author,
                "content": extracted_text.strip(),
                "excerpt": excerpt,
                "image_url": image_url,
            }
    except Exception as e:
        logger.warning(f"Trafilatura extraction encountered error for {url}: {e}")

    # Fallback to BeautifulSoup cleaning
    return clean_html_with_soup(html)
