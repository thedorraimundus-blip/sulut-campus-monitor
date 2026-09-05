import hashlib
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.database.models import Article
from app.services.crawler.validator import normalize_url


def compute_content_hash(title: str, content: str) -> str:
    """
    Compute a SHA-256 fingerprint hash of normalized title and content.
    Used for robust deduplication across syndication or republished articles.
    """
    norm_title = " ".join(title.strip().lower().split())
    norm_content = " ".join(content.strip().lower().split())
    payload = f"{norm_title}::{norm_content}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


class Deduplicator:
    """
    Deduplication engine checking:
    1. Normalized article URL
    2. SHA-256 Content Hash
    """

    @staticmethod
    def is_duplicate(db: Session, url: str, content_hash: str) -> Tuple[bool, Optional[Article], str]:
        """
        Check if an article already exists in the database by URL or content hash.
        Returns (is_dup, existing_article, reason).
        """
        norm_url = normalize_url(url)

        # 1. Exact normalized URL check
        existing_by_url = db.query(Article).filter(
            (Article.url == norm_url) | (Article.canonical_url == norm_url)
        ).first()
        if existing_by_url:
            return True, existing_by_url, f"Duplicate URL ({norm_url})"

        # 2. SHA-256 Content Hash check
        if content_hash:
            existing_by_hash = db.query(Article).filter(Article.content_hash == content_hash).first()
            if existing_by_hash:
                return True, existing_by_hash, f"Duplicate content hash ({content_hash[:8]}...)"

        return False, None, ""
