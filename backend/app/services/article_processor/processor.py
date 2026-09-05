import hashlib
import datetime
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.database.models import (
    Article, ArticleUniversity, ArticleCategory,
    SentimentAnalysis, AIPrediction, Alert, Source, University, Category
)
from app.ai.pipeline import process_article_intelligence
from app.utils.logger import logger

# Active WebSocket manager reference to broadcast live news
_ws_broadcast_callback = None


def set_ws_broadcast_callback(callback):
    """Register WebSocket broadcast callback from main.py / ws.py."""
    global _ws_broadcast_callback
    _ws_broadcast_callback = callback


async def notify_live_article(article_data: dict):
    """Notify WebSocket clients of newly saved article."""
    if _ws_broadcast_callback:
        try:
            await _ws_broadcast_callback({
                "type": "NEW_ARTICLE",
                "data": article_data
            })
        except Exception as e:
            logger.warning(f"Failed to broadcast article over WebSocket: {e}")


def compute_content_hash(title: str, content: str) -> str:
    """Compute SHA-256 hash from normalized title and content for deduplication."""
    norm = f"{title.strip().lower()}:{content.strip().lower()}"
    return hashlib.sha256(norm.encode("utf-8")).hexdigest()


async def process_and_save_article(
    source_id: Optional[int],
    title: str,
    url: str,
    content: str,
    author: Optional[str] = None,
    image_url: Optional[str] = None,
    published_at: Optional[datetime.datetime] = None,
    db: Optional[Session] = None
) -> Tuple[bool, Optional[Article], str]:
    """
    Deduplicates, executes local AI intelligence pipeline,
    persists article and related entities to SQLite, and triggers alerts if needed.
    Returns: (is_new, article_object, status_message)
    """
    if not title or not url or not content:
        return False, None, "Missing mandatory fields (title, url, content)"

    close_db_when_done = False
    if db is None:
        db = SessionLocal()
        close_db_when_done = True

    try:
        content_hash = compute_content_hash(title, content)

        # Deduplication check by URL or content hash
        existing = db.query(Article).filter(
            (Article.url == url) | (Article.content_hash == content_hash)
        ).first()

        if existing:
            return False, existing, "Article duplicate already exists"

        # Run Local AI Intelligence Pipeline
        ai_result = process_article_intelligence(title=title, content=content)

        excerpt = content[:250] + "..." if len(content) > 250 else content
        summary = ai_result["summary"]

        article = Article(
            source_id=source_id,
            title=title.strip(),
            url=url.strip(),
            canonical_url=url.strip(),
            author=author,
            content=content.strip(),
            excerpt=excerpt,
            summary=summary,
            image_url=image_url,
            published_at=published_at or datetime.datetime.utcnow(),
            scraped_at=datetime.datetime.utcnow(),
            content_hash=content_hash,
            language="id",
            is_relevant=ai_result["is_relevant"],
            relevance_score=ai_result["relevance_score"],
            is_demo=False
        )
        db.add(article)
        db.flush()

        # Link Detected Universities
        primary_univ_obj = None
        for u_item in ai_result["detected_universities"]:
            link = ArticleUniversity(
                article_id=article.id,
                university_id=u_item["university_id"],
                confidence_score=u_item["confidence_score"]
            )
            db.add(link)
            if not primary_univ_obj:
                primary_univ_obj = db.query(University).filter(University.id == u_item["university_id"]).first()

        # Link Category
        cat_name = ai_result["category"]
        category_obj = db.query(Category).filter(Category.name == cat_name).first()
        if category_obj:
            db.add(ArticleCategory(
                article_id=article.id,
                category_id=category_obj.id,
                confidence_score=ai_result["category_confidence"]
            ))

        # Link Sentiment Analysis
        sentiment_data = ai_result["sentiment_scores"]
        db.add(SentimentAnalysis(
            article_id=article.id,
            sentiment=ai_result["sentiment"],
            positive_score=sentiment_data["positive"],
            neutral_score=sentiment_data["neutral"],
            negative_score=sentiment_data["negative"]
        ))

        # Link AI Prediction Audit Record
        db.add(AIPrediction(
            article_id=article.id,
            model_version=ai_result["model_version"],
            prediction_type="category",
            prediction=ai_result["category"],
            confidence=ai_result["category_confidence"]
        ))

        # Alert evaluation: Check for negative sentiment or crisis alerts
        if ai_result["sentiment"] == "Negative" and (primary_univ_obj or ai_result["is_relevant"]):
            univ_name = primary_univ_obj.short_name if primary_univ_obj else "Perguruan Tinggi"
            alert = Alert(
                title=f"Berita Negatif: {univ_name}",
                message=f"Artikel baru '{article.title}' terdeteksi memiliki sentimen negatif (skor negatif {int(sentiment_data['negative'] * 100)}%).",
                article_id=article.id,
                university_id=primary_univ_obj.id if primary_univ_obj else None,
                alert_type="NEGATIVE_SENTIMENT",
                severity="WARNING" if sentiment_data["negative"] < 0.85 else "CRITICAL",
                is_read=False
            )
            db.add(alert)

        db.commit()

        # Prepare payload for live WebSocket broadcast
        source_name = ""
        if source_id:
            src = db.query(Source).filter(Source.id == source_id).first()
            if src:
                source_name = src.name

        ws_payload = {
            "id": article.id,
            "title": article.title,
            "url": article.url,
            "source_name": source_name,
            "published_at": str(article.published_at),
            "is_relevant": article.is_relevant,
            "relevance_score": article.relevance_score,
            "category": ai_result["category"],
            "sentiment": ai_result["sentiment"],
            "university": primary_univ_obj.short_name if primary_univ_obj else None,
            "summary": summary
        }
        await notify_live_article(ws_payload)

        return True, article, "Saved successfully"

    except Exception as e:
        db.rollback()
        logger.error(f"Error saving article {url}: {e}")
        return False, None, f"Database error: {str(e)}"
    finally:
        if close_db_when_done:
            db.close()
