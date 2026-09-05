import datetime
from typing import List, Dict, Any, Optional
from urllib.parse import urljoin, urlparse
import feedparser
import httpx
from bs4 import BeautifulSoup
from app.config import settings
from app.services.crawler.validator import is_safe_url, normalize_url
from app.utils.logger import logger


COMMON_FEED_PATHS = [
    "/feed",
    "/rss",
    "/rss.xml",
    "/feed.xml",
    "/atom.xml",
    "/index.xml"
]


async def discover_rss_feed(base_url: str) -> Optional[str]:
    """
    Auto-detect RSS/Atom feed URL for a given website:
    1. Inspect HTML <link> tags (application/rss+xml, application/atom+xml).
    2. Try common feed endpoints if not declared in header.
    """
    safe, msg = is_safe_url(base_url)
    if not safe:
        return None

    headers = {"User-Agent": settings.USER_AGENT}
    try:
        async with httpx.AsyncClient(timeout=10.0, headers=headers, follow_redirects=True) as client:
            resp = await client.get(base_url)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                # Look for link tags
                feed_link = soup.find("link", type=["application/rss+xml", "application/atom+xml"])
                if feed_link and feed_link.get("href"):
                    found_url = urljoin(base_url, feed_link["href"])
                    return found_url

            # Test common feed paths
            for path in COMMON_FEED_PATHS:
                test_url = urljoin(base_url, path)
                try:
                    probe = await client.head(test_url)
                    if probe.status_code == 200:
                        content_type = probe.headers.get("content-type", "").lower()
                        if "xml" in content_type or "rss" in content_type or "atom" in content_type:
                            return test_url
                except Exception:
                    continue
    except Exception as e:
        logger.warning(f"Error during RSS discovery for {base_url}: {e}")

    return None


async def parse_rss_feed(feed_url: str) -> List[Dict[str, Any]]:
    """
    Fetch and parse an RSS or Atom feed using feedparser.
    Returns structured list of article metadata.
    """
    safe, msg = is_safe_url(feed_url)
    if not safe:
        logger.error(f"Unsafe feed URL rejected: {feed_url} ({msg})")
        return []

    headers = {"User-Agent": settings.USER_AGENT}
    try:
        async with httpx.AsyncClient(timeout=settings.CRAWLER_TIMEOUT_SECONDS, headers=headers, follow_redirects=True) as client:
            resp = await client.get(feed_url)
            if resp.status_code != 200:
                logger.warning(f"Failed to fetch feed {feed_url}, status code: {resp.status_code}")
                return []

            parsed = feedparser.parse(resp.content)
            articles = []

            for entry in parsed.entries:
                link = entry.get("link", "")
                if not link:
                    continue

                normalized_link = normalize_url(link)
                title = entry.get("title", "").strip()
                author = entry.get("author", "")
                summary = entry.get("summary", "") or entry.get("description", "")

                # Clean summary from html tags if present
                if summary:
                    summary = BeautifulSoup(summary, "html.parser").get_text().strip()

                # Parse publication date
                published_at = None
                if hasattr(entry, "published_parsed") and entry.published_parsed:
                    try:
                        published_at = datetime.datetime(*entry.published_parsed[:6])
                    except Exception:
                        pass
                elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                    try:
                        published_at = datetime.datetime(*entry.updated_parsed[:6])
                    except Exception:
                        pass

                # Try image extraction from media content or enclosures
                image_url = ""
                if hasattr(entry, "media_content") and entry.media_content:
                    image_url = entry.media_content[0].get("url", "")
                elif hasattr(entry, "enclosures") and entry.enclosures:
                    image_url = entry.enclosures[0].get("href", "")

                articles.append({
                    "title": title,
                    "url": normalized_link,
                    "author": author,
                    "summary": summary,
                    "published_at": published_at,
                    "image_url": image_url
                })

            return articles

    except Exception as e:
        logger.error(f"Error parsing feed {feed_url}: {e}")
        return []
