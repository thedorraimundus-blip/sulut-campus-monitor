import time
import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.database.models import (
    Article, ArticleUniversity, ArticleCategory,
    SentimentAnalysis, AIPrediction, Category, University, Alert
)
from app.ai.tokenizer import clean_text
from app.ai.entity_detector import entity_detector
from app.ai.relevance import calculate_relevance
from app.ai.classifier import classify_category
from app.ai.sentiment import analyze_sentiment
from app.ai.summarizer import summarize_text
from app.ai.model_manager import model_manager
from app.utils.logger import logger, log_event


def process_article_intelligence(title: str, content: str) -> Dict[str, Any]:
    """
    Execute the full local AI/NLP intelligence pipeline on in-memory article text:
    1. Entity recognition (Universities & aliases in Sulut)
    2. Campus relevance scoring (0 - 100) & confidence (0.0 - 1.0)
    3. Category classification (19 categories) & confidence
    4. Sentiment analysis (Positive / Neutral / Negative) & confidence
    5. Extractive summarization (2 - 4 salient sentences)
    """
    try:
        combined_text = f"{title}. {content}"

        # 1. University Detection
        detected_univs = entity_detector.detect(combined_text)
        univ_names = [u["name"] for u in detected_univs]

        # 2. Relevance Scoring
        is_relevant, relevance_score, rel_debug = calculate_relevance(
            title=title,
            content=content,
            detected_universities=univ_names
        )

        # 3. Category Classification
        category, cat_confidence, model_version = classify_category(combined_text)

        # 4. Sentiment Analysis
        sentiment, pos_score, neu_score, neg_score = analyze_sentiment(combined_text)

        # Compute sentiment primary confidence
        sentiment_conf = max(pos_score, neu_score, neg_score)

        # 5. Extractive Summarization
        summary = summarize_text(content, max_sentences=3)
        if not summary:
            summary = content[:250] + "..." if len(content) > 250 else content

        return {
            "is_relevant": is_relevant,
            "relevance_score": relevance_score,
            "relevance_confidence": rel_debug.get("confidence", round(relevance_score / 100.0, 2)),
            "detected_universities": detected_univs,
            "category": category,
            "category_confidence": cat_confidence,
            "sentiment": sentiment,
            "sentiment_confidence": round(sentiment_conf, 2),
            "sentiment_scores": {
                "positive": pos_score,
                "neutral": neu_score,
                "negative": neg_score
            },
            "summary": summary,
            "model_version": model_version,
            "debug": rel_debug
        }
    except Exception as e:
        logger.error(f"[AI Pipeline] Error executing in-memory analysis: {e}")
        return {
            "is_relevant": False,
            "relevance_score": 0.0,
            "relevance_confidence": 0.1,
            "detected_universities": [],
            "category": "Pendidikan",
            "category_confidence": 0.5,
            "sentiment": "Neutral",
            "sentiment_confidence": 0.6,
            "sentiment_scores": {"positive": 0.1, "neutral": 0.8, "negative": 0.1},
            "summary": content[:250] if content else "",
            "model_version": model_manager.active_version,
            "debug": {"error": str(e)}
        }


def analyze_article(article_id: int, db: Optional[Session] = None) -> Dict[str, Any]:
    """
    Full AI analysis pipeline for a single stored article:
    1. Load article from SQLite
    2. Clean text
    3. Check relevance
    4. Detect university entities
    5. Classify category
    6. Analyze sentiment
    7. Generate summary
    8. Save AI results, links, and predictions to SQLite
    9. Record execution to system_logs
    10. Return analysis result
    """
    should_close_db = False
    if db is None:
        db = SessionLocal()
        should_close_db = True

    start_time = time.time()
    try:
        article = db.query(Article).filter(Article.id == article_id).first()
        if not article:
            return {"success": False, "error": f"Article {article_id} not found"}

        # Run AI/NLP Engine
        ai_res = process_article_intelligence(title=article.title, content=article.content)

        # Update article fields
        article.is_relevant = ai_res["is_relevant"]
        article.relevance_score = ai_res["relevance_score"]
        article.summary = ai_res["summary"]
        if not article.excerpt or len(article.excerpt) < 50:
            article.excerpt = ai_res["summary"]

        # 1. Link detected universities
        # Remove old links first to avoid duplicate primary keys
        db.query(ArticleUniversity).filter(ArticleUniversity.article_id == article.id).delete()
        for u in ai_res["detected_universities"]:
            db.add(ArticleUniversity(
                article_id=article.id,
                university_id=u["university_id"],
                confidence_score=u["confidence_score"]
            ))

        # 2. Link category
        db.query(ArticleCategory).filter(ArticleCategory.article_id == article.id).delete()
        category_record = db.query(Category).filter(Category.name == ai_res["category"]).first()
        if not category_record:
            category_record = db.query(Category).first()
        if category_record:
            db.add(ArticleCategory(
                article_id=article.id,
                category_id=category_record.id,
                confidence_score=ai_res["category_confidence"]
            ))

        # 3. Save Sentiment Analysis
        db.query(SentimentAnalysis).filter(SentimentAnalysis.article_id == article.id).delete()
        sentiment_rec = SentimentAnalysis(
            article_id=article.id,
            sentiment=ai_res["sentiment"],
            positive_score=ai_res["sentiment_scores"]["positive"],
            neutral_score=ai_res["sentiment_scores"]["neutral"],
            negative_score=ai_res["sentiment_scores"]["negative"],
            created_at=datetime.datetime.utcnow()
        )
        db.add(sentiment_rec)

        # 4. Record granular AI Predictions
        db.query(AIPrediction).filter(AIPrediction.article_id == article.id).delete()
        active_ver = ai_res["model_version"]

        predictions = [
            AIPrediction(
                article_id=article.id,
                model_version=active_ver,
                prediction_type="relevance",
                prediction="relevant" if ai_res["is_relevant"] else "irrelevant",
                confidence=ai_res["relevance_confidence"],
                created_at=datetime.datetime.utcnow()
            ),
            AIPrediction(
                article_id=article.id,
                model_version=active_ver,
                prediction_type="category",
                prediction=ai_res["category"],
                confidence=ai_res["category_confidence"],
                created_at=datetime.datetime.utcnow()
            ),
            AIPrediction(
                article_id=article.id,
                model_version=active_ver,
                prediction_type="sentiment",
                prediction=ai_res["sentiment"],
                confidence=ai_res["sentiment_confidence"],
                created_at=datetime.datetime.utcnow()
            )
        ]
        for u in ai_res["detected_universities"]:
            predictions.append(AIPrediction(
                article_id=article.id,
                model_version=active_ver,
                prediction_type="entity",
                prediction=u["name"],
                confidence=u["confidence_score"],
                created_at=datetime.datetime.utcnow()
            ))

        for p in predictions:
            db.add(p)

        # 5. Intelligent Alert Triggering (with deduplication)
        primary_univ_id = ai_res["detected_universities"][0]["university_id"] if ai_res["detected_universities"] else None
        existing_alert = db.query(Alert).filter(Alert.article_id == article.id).first()

        if not existing_alert:
            # Condition A: High-confidence negative sentiment
            if ai_res["sentiment"] == "Negative" and ai_res["sentiment_confidence"] >= 0.70:
                db.add(Alert(
                    title=f"Sentimen Negatif Terdeteksi: {article.title[:80]}...",
                    message=f"Artikel mengenai kampus terdeteksi bersentimen negatif (skor keyakinan {ai_res['sentiment_confidence']:.0%}).",
                    article_id=article.id,
                    university_id=primary_univ_id,
                    alert_type="NEGATIVE_SENTIMENT",
                    severity="CRITICAL" if ai_res["sentiment_confidence"] >= 0.85 else "WARNING",
                    is_read=False,
                    created_at=datetime.datetime.utcnow()
                ))
            # Condition B: High relevance score
            elif ai_res["is_relevant"] and ai_res["relevance_score"] >= 90.0:
                db.add(Alert(
                    title=f"Berita Kampus Utama: {article.title[:80]}...",
                    message=f"Artikel memiliki relevansi sangat tinggi ({ai_res['relevance_score']:.0f}/100) terhadap perguruan tinggi Sulawesi Utara.",
                    article_id=article.id,
                    university_id=primary_univ_id,
                    alert_type="HIGH_RELEVANCE",
                    severity="INFO",
                    is_read=False,
                    created_at=datetime.datetime.utcnow()
                ))

        db.commit()

        elapsed_ms = int((time.time() - start_time) * 1000)
        log_event(
            "ai",
            f"Article {article.id} analyzed successfully in {elapsed_ms}ms ({ai_res['category']}, {ai_res['sentiment']}, rel={ai_res['relevance_score']})",
            "INFO"
        )

        return {
            "success": True,
            "article_id": article.id,
            "title": article.title,
            "is_relevant": ai_res["is_relevant"],
            "relevance_score": ai_res["relevance_score"],
            "relevance_confidence": ai_res["relevance_confidence"],
            "category": ai_res["category"],
            "category_confidence": ai_res["category_confidence"],
            "sentiment": ai_res["sentiment"],
            "sentiment_confidence": ai_res["sentiment_confidence"],
            "detected_universities": ai_res["detected_universities"],
            "summary": ai_res["summary"],
            "model_version": active_ver,
            "duration_ms": elapsed_ms
        }
    except Exception as e:
        logger.error(f"[AI Pipeline] Failed to analyze article {article_id}: {e}")
        log_event("ai", f"Failed to analyze article {article_id}: {str(e)}", "ERROR")
        return {"success": False, "article_id": article_id, "error": str(e)}
    finally:
        if should_close_db:
            db.close()
