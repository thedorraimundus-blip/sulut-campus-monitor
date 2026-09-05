import time
import datetime
import asyncio
from typing import Dict, Any, List, Optional
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin

from app.config import settings
from app.database.database import SessionLocal
from app.database.models import Source, CrawlLog, Article
from app.services.crawler.validator import is_safe_url, normalize_url
from app.services.crawler.robots import is_allowed_by_robots
from app.services.crawler.rss_parser import discover_rss_feed, parse_rss_feed
from app.services.crawler.html_scraper import extract_article_content
from app.services.article_processor.processor import process_and_save_article
from app.utils.logger import logger, log_event


class CrawlerEngine:
    def __init__(self):
        self.is_crawling = False

    async def scan_source(self, source_id: int) -> Dict[str, Any]:
        """
        Scan a single media source:
        1. Check safety and robots.txt.
        2. Detect RSS or use HTML scraper.
        3. Extract articles.
        4. Pass to article processor for AI analysis & deduplication.
        5. Record crawl log and update source status.
        """
        db = SessionLocal()
        source = db.query(Source).filter(Source.id == source_id).first()
        if not source:
            db.close()
            return {"status": "ERROR", "message": f"Source {source_id} not found"}

        start_time = time.time()
        log_event("crawler", f"Crawl started for source: {source.name} ({source.base_url})", "INFO")
        source.status = "CRAWLING"
        db.commit()

        articles_found = 0
        articles_new = 0
        error_msg = None
        status = "SUCCESS"

        try:
            # 1. URL Safety Check
            safe, msg = is_safe_url(source.base_url)
            if not safe:
                raise ValueError(f"Target URL rejected for security: {msg}")

            # 2. Check Robots.txt
            allowed = await is_allowed_by_robots(source.base_url)
            if not allowed:
                raise PermissionError(f"Robots.txt disallows crawling for {source.base_url}")

            # 3. Determine if RSS feed is available
            feed_url = source.rss_url
            if not feed_url or source.source_type == "rss":
                detected = await discover_rss_feed(source.base_url)
                if detected:
                    feed_url = detected
                    source.rss_url = detected
                    db.commit()

            candidate_articles = []

            # Strategy A: RSS Crawling
            if feed_url:
                logger.info(f"Crawling via RSS for {source.name}: {feed_url}")
                rss_items = await parse_rss_feed(feed_url)
                for item in rss_items:
                    candidate_articles.append(item)

            # Strategy B: HTML Crawling fallback / supplementary
            if not candidate_articles or source.source_type == "html":
                logger.info(f"Crawling via HTML homepage parser for {source.name}: {source.base_url}")
                html_candidates = await self._crawl_html_homepage(source.base_url)
                candidate_articles.extend(html_candidates)

            articles_found = len(candidate_articles)
            logger.info(f"Found {articles_found} candidate articles from {source.name}")

            # 4. Fetch full text and process each candidate article
            async with httpx.AsyncClient(
                timeout=settings.CRAWLER_TIMEOUT_SECONDS,
                headers={"User-Agent": settings.USER_AGENT},
                follow_redirects=True
            ) as client:
                for cand in candidate_articles[:15]:  # Process up to 15 recent articles per scan
                    article_url = cand.get("url")
                    if not article_url:
                        continue

                    # Respect crawl delay
                    await asyncio.sleep(settings.CRAWLER_RATE_LIMIT_DELAY)

                    content = cand.get("content") or ""
                    title = cand.get("title") or ""
                    author = cand.get("author") or ""
                    image_url = cand.get("image_url") or ""
                    published_at = cand.get("published_at")

                    # If content is empty or short, fetch full article HTML
                    if len(content) < 150:
                        try:
                            resp = await client.get(article_url)
                            if resp.status_code == 200:
                                parsed_html = extract_article_content(resp.text, article_url)
                                if not title and parsed_html.get("title"):
                                    title = parsed_html["title"]
                                content = parsed_html.get("content", "")
                                if not author and parsed_html.get("author"):
                                    author = parsed_html["author"]
                                if not image_url and parsed_html.get("image_url"):
                                    image_url = parsed_html["image_url"]
                        except Exception as fetch_err:
                            logger.warning(f"Could not fetch full page for {article_url}: {fetch_err}")

                    if title and content:
                        is_new, saved_art, save_msg = await process_and_save_article(
                            source_id=source.id,
                            title=title,
                            url=article_url,
                            content=content,
                            author=author,
                            image_url=image_url,
                            published_at=published_at,
                            db=db
                        )
                        if is_new:
                            articles_new += 1

            source.status = "ACTIVE"
            source.last_crawled = datetime.datetime.utcnow()
            source.error_count = 0

        except Exception as e:
            status = "FAILED"
            error_msg = str(e)
            source.status = "ERROR"
            source.error_count += 1
            log_event("crawler", f"Crawl error for {source.name}: {error_msg}", "ERROR")

        duration_ms = int((time.time() - start_time) * 1000)

        # Record CrawlLog
        crawl_log = CrawlLog(
            source_id=source.id,
            status=status,
            articles_found=articles_found,
            articles_new=articles_new,
            error_message=error_msg,
            duration_ms=duration_ms,
            created_at=datetime.datetime.utcnow()
        )
        db.add(crawl_log)
        db.commit()
        db.close()

        log_event(
            "crawler",
            f"Crawl finished for {source.name}: {articles_new} new of {articles_found} articles ({duration_ms}ms)",
            "INFO"
        )

        return {
            "source_id": source_id,
            "status": status,
            "articles_found": articles_found,
            "articles_new": articles_new,
            "duration_ms": duration_ms,
            "error": error_msg
        }

    async def _crawl_html_homepage(self, base_url: str) -> List[Dict[str, Any]]:
        """Extract article links and titles from a news homepage."""
        articles = []
        try:
            async with httpx.AsyncClient(
                timeout=12.0,
                headers={"User-Agent": settings.USER_AGENT},
                follow_redirects=True
            ) as client:
                resp = await client.get(base_url)
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    links = soup.find_all("a", href=True)
                    seen_urls = set()

                    for a in links:
                        href = a["href"]
                        full_url = normalize_url(urljoin(base_url, href))
                        # Basic news article heuristic (URL path length and keyword filter)
                        if (
                            full_url not in seen_urls
                            and full_url.startswith(base_url)
                            and len(full_url) > len(base_url) + 10
                            and not any(x in full_url for x in ["/tag/", "/category/", "/author/", "/page/", "#"])
                        ):
                            title = a.get_text().strip()
                            if len(title) > 20:
                                seen_urls.add(full_url)
                                articles.append({
                                    "title": title,
                                    "url": full_url,
                                    "content": ""
                                })
                                if len(articles) >= 15:
                                    break
        except Exception as e:
            logger.warning(f"Error crawling HTML homepage {base_url}: {e}")

        return articles

    async def crawl_all_active_sources(self) -> List[Dict[str, Any]]:
        """Run crawler sequentially across all active media sources."""
        if self.is_crawling:
            logger.info("Crawler run already in progress. Skipping duplicate run.")
            return []

        self.is_crawling = True
        results = []
        db = SessionLocal()
        try:
            active_sources = db.query(Source).filter(Source.is_active == True).all()
            source_ids = [s.id for s in active_sources]
        finally:
            db.close()

        logger.info(f"Starting scheduled crawl cycle for {len(source_ids)} active sources.")
        try:
            for s_id in source_ids:
                res = await self.scan_source(s_id)
                results.append(res)
        finally:
            self.is_crawling = False

        return results


crawler_engine = CrawlerEngine()
