from typing import Dict, Any, List
from app.ai.tokenizer import clean_text
from app.ai.entity_detector import entity_detector
from app.ai.relevance import calculate_relevance
from app.ai.classifier import classify_category
from app.ai.sentiment import analyze_sentiment
from app.ai.summarizer import summarize_text
from app.utils.logger import logger


def process_article_intelligence(title: str, content: str) -> Dict[str, Any]:
    """
    Execute the full local AI/NLP intelligence pipeline on an article:
    1. Entity recognition (Universities & aliases in Sulut)
    2. Campus relevance scoring (0 - 100)
    3. Category classification (19 categories)
    4. Sentiment analysis (Positive / Neutral / Negative)
    5. Extractive summarization (salient sentences)
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

        # 5. Extractive Summarization
        summary = summarize_text(content, max_sentences=3)
        if not summary:
            summary = content[:250] + "..." if len(content) > 250 else content

        return {
            "is_relevant": is_relevant,
            "relevance_score": relevance_score,
            "detected_universities": detected_univs,
            "category": category,
            "category_confidence": cat_confidence,
            "sentiment": sentiment,
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
        logger.error(f"Error in local AI intelligence pipeline: {e}")
        # Graceful fallback so crawler never crashes
        return {
            "is_relevant": False,
            "relevance_score": 0.0,
            "detected_universities": [],
            "category": "Lainnya",
            "category_confidence": 0.5,
            "sentiment": "Neutral",
            "sentiment_scores": {"positive": 0.1, "neutral": 0.8, "negative": 0.1},
            "summary": content[:250] if content else "",
            "model_version": "v1.0.0-bootstrap",
            "debug": {"error": str(e)}
        }
