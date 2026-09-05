import re
from typing import List, Dict, Any, Set
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from app.services.crawler.base import BaseCrawler
from app.services.crawler.validator import normalize_url
from app.utils.logger import logger


EXCLUDED_PATTERNS = [
    r"/tag/", r"/category/", r"/kategori/", r"/author/", r"/penulis/",
    r"/page/", r"/halaman/", r"/feed", r"/search", r"/cari", r"/login",
    r"/register", r"/daftar", r"/contact", r"/hubungi", r"/tentang", r"/about",
    r"/privacy", r"/kebijakan", r"/terms", r"/syarat", r"/iklan", r"/ads",
    r"/video/", r"/galeri/", r"/foto/", r"\.pdf$", r"\.jpg$", r"\.png$"
]
COMPILED_EXCLUDES = [re.compile(p, re.IGNORECASE) for p in EXCLUDED_PATTERNS]


class HTMLCrawler(BaseCrawler):
    """
    Crawler dedicated to discovering and collecting article links from HTML media homepages or index pages.
    """

    async def discover_article_links(self, base_url: str, max_links: int = 25) -> List[Dict[str, Any]]:
        """
        Fetch HTML homepage and identify candidate news article URLs based on:
        - Internal domain match
        - Non-nav/non-tag link heuristic
        - Title text length and URL slug depth
        """
        html = await self.fetch(base_url)
        if not html:
            return []

        soup = BeautifulSoup(html, "html.parser")
        parsed_base = urlparse(base_url)
        base_domain = parsed_base.netloc.lower()

        # Remove header, footer, navigation from link exploration
        for element in soup.find_all(["header", "footer", "nav", "aside", "menu"]):
            element.decompose()

        links = soup.find_all("a", href=True)
        discovered: List[Dict[str, Any]] = []
        seen_urls: Set[str] = set()

        for a in links:
            raw_href = a["href"].strip()
            if not raw_href or raw_href.startswith(("#", "javascript:", "mailto:", "tel:")):
                continue

            full_url = urljoin(base_url, raw_href)
            normalized = normalize_url(full_url)
            parsed_url = urlparse(normalized)

            # Ensure link belongs to same domain
            if parsed_url.netloc.lower() != base_domain:
                continue

            # Ensure link is not excluded by patterns
            if any(p.search(parsed_url.path) for p in COMPILED_EXCLUDES):
                continue

            # Article URL heuristic: path must have reasonable depth/slug (e.g. /berita/judul-panjang)
            path_segments = [s for s in parsed_url.path.strip("/").split("/") if s]
            if len(path_segments) < 1:
                continue

            # Check anchor text or title attribute
            title = a.get_text().strip() or a.get("title", "").strip()
            if len(title) < 20:  # News article titles typically > 20 characters
                continue

            if normalized not in seen_urls:
                seen_urls.add(normalized)
                discovered.append({
                    "title": title,
                    "url": normalized,
                    "summary": "",
                    "content": "",
                })
                if len(discovered) >= max_links:
                    break

        logger.info(f"[HTMLCrawler] Discovered {len(discovered)} candidate article links on {base_url}")
        return discovered
