"""
Crawler subsystem for SULUT CAMPUS MONITOR.
Provides modular, async crawling, RSS parsing, HTML extraction,
robots.txt verification, and duplicate detection.
"""

from app.services.crawler.base import BaseCrawler
from app.services.crawler.robots import is_allowed_by_robots
from app.services.crawler.validator import is_safe_url, normalize_url
from app.services.crawler.rss_crawler import RSSCrawler
from app.services.crawler.html_crawler import HTMLCrawler
from app.services.crawler.article_extractor import extract_article, clean_text, generate_excerpt
from app.services.crawler.deduplicator import Deduplicator, compute_content_hash
from app.services.crawler.manager import CrawlerManager, crawler_manager

__all__ = [
    "BaseCrawler",
    "is_allowed_by_robots",
    "is_safe_url",
    "normalize_url",
    "RSSCrawler",
    "HTMLCrawler",
    "extract_article",
    "clean_text",
    "generate_excerpt",
    "Deduplicator",
    "compute_content_hash",
    "CrawlerManager",
    "crawler_manager",
]
