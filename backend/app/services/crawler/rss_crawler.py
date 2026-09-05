import datetime
from typing import List, Dict, Any, Optional
from urllib.parse import urljoin
import feedparser
from bs4 import BeautifulSoup
from app.services.crawler.base import BaseCrawler
from app.services.crawler.validator import normalize_url
from app.utils.logger import logger


COMMON_FEED_PATHS = [
    "/feed",
    "/rss",
    "/rss.xml",
    "/feed.xml",
    "/atom.xml",
    "/index.xml",
    "/feeds/posts/default",
]


class RSSCrawler(BaseCrawler):
    """
    Crawler dedicated to discovering, fetching, and parsing RSS/Atom feeds.
    """

    async def discover_feed(self, base_url: str) -> Optional[str]:
        """
        Discover RSS or Atom feed for a website:
        1. Parse <link rel="alternate" type="application/rss+xml"> tags from homepage.
        2. Probe common endpoint conventions (/feed, /rss.xml, etc.).
        """
        homepage_html = await self.fetch(base_url)
        if homepage_html:
            try:
                soup = BeautifulSoup(homepage_html, "html.parser")
                feed_link = soup.find(
                    "link",
                    attrs={
                        "rel": lambda r: r and "alternate" in r,
                        "type": lambda t: t and any(x in t for x in ["application/rss+xml", "application/atom+xml", "text/xml"])
                    }
                )
                if feed_link and feed_link.get("href"):
                    candidate = urljoin(base_url, feed_link["href"])
                    logger.info(f"[RSSCrawler] Discovered feed via <link> tag: {candidate}")
                    return candidate
            except Exception as e:
                logger.warning(f"[RSSCrawler] Error inspecting <link> tags on {base_url}: {e}")

        # Check common feed paths
        for path in COMMON_FEED_PATHS:
            test_url = urljoin(base_url, path)
            body = await self.fetch(test_url)
            if body:
                try:
                    parsed = feedparser.parse(body)
                    if parsed.entries and len(parsed.entries) > 0:
                        logger.info(f"[RSSCrawler] Discovered active feed at {test_url}")
                        return test_url
                except Exception:
                    continue

        return None

    async def parse_feed(self, feed_url: str) -> List[Dict[str, Any]]:
        """
        Fetch and parse an RSS or Atom feed.
        Returns a list of structured candidate article dicts.
        """
        xml_content = await self.fetch(feed_url)
        if not xml_content:
            logger.warning(f"[RSSCrawler] Could not fetch XML content from {feed_url}")
            return []

        parsed = feedparser.parse(xml_content)
        articles: List[Dict[str, Any]] = []

        for entry in parsed.entries:
            link = entry.get("link", "")
            if not link:
                continue

            normalized_link = normalize_url(link)
            title = entry.get("title", "").strip()
            author = entry.get("author", "")
            summary = entry.get("summary", "") or entry.get("description", "")

            # Strip HTML tags from summary
            if summary:
                try:
                    summary = BeautifulSoup(summary, "html.parser").get_text().strip()
                except Exception:
                    pass

            # Parse published timestamp
            published_at = None
            if hasattr(entry, "published_parsed") and entry.published_parsed:
                try:
                    published_at = datetime.datetime(*entry.published_parsed[:6])
                except Exception:
                    published_at = None
            elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                try:
                    published_at = datetime.datetime(*entry.updated_parsed[:6])
                except Exception:
                    published_at = None

            # Extract image from media_content or enclosures
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
                "content": summary,  # Will be enriched by article_extractor if needed
                "published_at": published_at,
                "image_url": image_url,
            })

        logger.info(f"[RSSCrawler] Parsed {len(articles)} items from {feed_url}")
        return articles
