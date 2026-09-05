import asyncio
import datetime
import time
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.config import settings
from app.database.database import SessionLocal
from app.database.models import Source, CrawlLog, Article
from app.services.crawler.base import BaseCrawler
from app.services.crawler.validator import is_safe_url, normalize_url
from app.services.crawler.robots import is_allowed_by_robots
from app.services.crawler.rss_crawler import RSSCrawler
from app.services.crawler.html_crawler import HTMLCrawler
from app.services.crawler.article_extractor import extract_article
from app.services.crawler.deduplicator import Deduplicator, compute_content_hash
from app.ai.pipeline import analyze_article
from app.utils.logger import logger, log_event


class CrawlerManager:
    """
    Crawler orchestrator for SULUT CAMPUS MONITOR:
    1. Inspects source configuration (AUTO, RSS, HTML).
    2. Enforces robots.txt and security validation.
    3. Gathers candidate articles (via RSS or HTML link discovery).
    4. Extracts clean article body, title, author, image, and creates excerpt.
    5. Deduplicates against database (URL + SHA-256 content hash).
    6. Stores raw new articles in SQLite (Phase 4 scope: no LLMs/AI).
    7. Logs execution status to crawl_logs (SUCCESS, PARTIAL, FAILED, BLOCKED).
    """

    def __init__(self):
        self.is_crawling = False
        self.rss_crawler = RSSCrawler(user_agent="SCM-NewsMonitor/1.0", timeout=15.0)
        self.html_crawler = HTMLCrawler(user_agent="SCM-NewsMonitor/1.0", timeout=15.0)
        self.base_fetcher = BaseCrawler(user_agent="SCM-NewsMonitor/1.0", timeout=15.0)

    async def crawl_source(self, source_id: int) -> Dict[str, Any]:
        """
        Crawl a single media source by ID.
        Ensures thread-safe and isolated execution.
        """
        db = SessionLocal()
        source = db.query(Source).filter(Source.id == source_id).first()
        if not source:
            db.close()
            return {"status": "FAILED", "error": f"Source {source_id} not found"}

        start_time = time.time()
        log_event("crawler", f"Starting crawl for {source.name} ({source.base_url})", "INFO")
        source.status = "CRAWLING"
        db.commit()

        articles_found = 0
        articles_new = 0
        error_msg = None
        crawl_status = "SUCCESS"

        try:
            # 1. Security & Scheme Check
            safe, reason = is_safe_url(source.base_url)
            if not safe:
                crawl_status = "BLOCKED"
                raise ValueError(f"Target URL security violation: {reason}")

            # 2. Check Robots.txt
            allowed = await is_allowed_by_robots(source.base_url, user_agent="SCM-NewsMonitor/1.0")
            if not allowed:
                crawl_status = "BLOCKED"
                raise PermissionError(f"Robots.txt disallows crawling for {source.base_url}")

            # 3. Handle Source Types: AUTO, RSS, HTML
            mode = (source.source_type or "auto").lower()
            feed_url = source.rss_url
            candidates: List[Dict[str, Any]] = []

            # Auto-detect RSS if mode is auto or rss and rss_url is missing
            if (mode in ("auto", "rss")) and not feed_url:
                detected = await self.rss_crawler.discover_feed(source.base_url)
                if detected:
                    feed_url = detected
                    source.rss_url = detected
                    db.commit()

            # Attempt RSS parsing
            if feed_url and mode in ("auto", "rss"):
                logger.info(f"[CrawlerManager] Crawling RSS feed: {feed_url}")
                rss_items = await self.rss_crawler.parse_feed(feed_url)
                candidates.extend(rss_items)

            # Fallback or primary HTML crawling
            if not candidates and mode in ("auto", "html"):
                logger.info(f"[CrawlerManager] Crawling HTML homepage: {source.base_url}")
                html_items = await self.html_crawler.discover_article_links(source.base_url, max_links=20)
                candidates.extend(html_items)

            articles_found = len(candidates)
            logger.info(f"[CrawlerManager] Source {source.name}: found {articles_found} candidate articles.")

            # 4. Extract full content and deduplicate
            for cand in candidates[:20]:  # Safe batch per source run
                url = cand.get("url")
                if not url:
                    continue

                title = cand.get("title") or ""
                content = cand.get("content") or ""
                author = cand.get("author") or ""
                image_url = cand.get("image_url") or ""
                published_at = cand.get("published_at")

                # If full content is missing, fetch article webpage
                if len(content) < 120:
                    html_page = await self.base_fetcher.fetch(url)
                    if html_page:
                        extracted = extract_article(html_page, url)
                        if not title and extracted.get("title"):
                            title = extracted["title"]
                        content = extracted.get("content") or content
                        if not author and extracted.get("author"):
                            author = extracted["author"]
                        if not image_url and extracted.get("image_url"):
                            image_url = extracted["image_url"]
                        if not published_at and extracted.get("published_at"):
                            published_at = extracted["published_at"]

                if not title or not content:
                    continue

                # Generate excerpt and content hash
                content_hash = compute_content_hash(title, content)
                is_dup, _, _ = Deduplicator.is_duplicate(db, url, content_hash)
                if is_dup:
                    continue

                # Excerpt up to 200 chars
                clean_excerpt = cand.get("summary")
                if not clean_excerpt or len(clean_excerpt) < 50:
                    clean_excerpt = content[:200] + "..." if len(content) > 200 else content

                # Persist raw article to DB without AI classification (Phase 4 scope)
                article = Article(
                    source_id=source.id,
                    title=title.strip(),
                    url=normalize_url(url),
                    canonical_url=normalize_url(url),
                    author=author[:128] if author else None,
                    content=content.strip(),
                    excerpt=clean_excerpt.strip(),
                    summary=None,
                    image_url=image_url[:1024] if image_url else None,
                    published_at=published_at or datetime.datetime.utcnow(),
                    scraped_at=datetime.datetime.utcnow(),
                    content_hash=content_hash,
                    language="id",
                    is_relevant=None,
                    relevance_score=None,
                    is_demo=False
                )
                db.add(article)
                db.flush()
                articles_new += 1

                # Automatically trigger local AI analysis on newly discovered article
                try:
                    analyze_article(article.id, db=db)
                except Exception as ai_err:
                    logger.warning(f"[CrawlerManager] Auto AI analysis error for article {article.id}: {ai_err}")

            source.status = "ACTIVE"
            source.last_crawled = datetime.datetime.utcnow()
            source.error_count = 0
            db.commit()

        except Exception as e:
            if crawl_status != "BLOCKED":
                crawl_status = "FAILED"
            error_msg = str(e)
            source.status = "ERROR" if crawl_status == "FAILED" else "BLOCKED"
            source.error_count = (source.error_count or 0) + 1
            log_event("crawler", f"Crawl error for {source.name}: {error_msg}", "ERROR")

        duration_ms = int((time.time() - start_time) * 1000)

        # Record to crawl_logs table
        crawl_log = CrawlLog(
            source_id=source.id,
            status=crawl_status,
            articles_found=articles_found,
            articles_new=articles_new,
            error_message=error_msg,
            duration_ms=duration_ms,
            created_at=datetime.datetime.utcnow()
        )
        db.add(crawl_log)
        source_name = source.name
        source_id_val = source.id
        db.commit()
        db.close()

        log_event(
            "crawler",
            f"Finished {source_name}: {articles_new} new / {articles_found} found ({duration_ms}ms, {crawl_status})",
            "INFO"
        )

        return {
            "source_id": source_id_val,
            "status": crawl_status,
            "articles_found": articles_found,
            "articles_new": articles_new,
            "duration_ms": duration_ms,
            "error_message": error_msg
        }

    async def crawl_all_active_sources(self) -> List[Dict[str, Any]]:
        """Run crawl sequentially across all active sources."""
        if self.is_crawling:
            logger.info("[CrawlerManager] Crawl run already active. Skipping duplicate call.")
            return []

        self.is_crawling = True
        results = []
        db = SessionLocal()
        try:
            active_sources = db.query(Source).filter(Source.is_active == True).all()
            source_ids = [s.id for s in active_sources]
        finally:
            db.close()

        logger.info(f"[CrawlerManager] Starting batch crawl across {len(source_ids)} active sources.")
        try:
            for sid in source_ids:
                res = await self.crawl_source(sid)
                results.append(res)
        finally:
            self.is_crawling = False

        return results


crawler_manager = CrawlerManager()
