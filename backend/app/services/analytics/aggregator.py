import datetime
from typing import Dict, Any, List
from collections import Counter
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.database.models import (
    Article, University, ArticleUniversity, Category, ArticleCategory,
    SentimentAnalysis, Source
)
from app.ai.tokenizer import ALL_STOPWORDS, clean_text


def get_analytics_summary(days: int = 14) -> Dict[str, Any]:
    """Compute comprehensive analytics data for Recharts visualizations."""
    db = SessionLocal()
    try:
        since_date = datetime.datetime.utcnow() - datetime.timedelta(days=days)

        # 1. Total & Relevant counts
        total_articles = db.query(Article).count()
        relevant_articles = db.query(Article).filter(Article.is_relevant == True).count()

        # 2. Articles per Day (Time Series Volume)
        articles_recent = db.query(Article).filter(Article.created_at >= since_date).all()
        volume_by_day = {}
        for i in range(days):
            day_str = (datetime.datetime.utcnow() - datetime.timedelta(days=days - 1 - i)).strftime("%d/%m")
            volume_by_day[day_str] = {"date": day_str, "total": 0, "relevant": 0}

        for art in articles_recent:
            d_str = art.created_at.strftime("%d/%m")
            if d_str in volume_by_day:
                volume_by_day[d_str]["total"] += 1
                if art.is_relevant:
                    volume_by_day[d_str]["relevant"] += 1

        volume_trend = list(volume_by_day.values())

        # 3. Share of Voice (Coverage per University)
        univ_stats = []
        universities = db.query(University).filter(University.is_active == True).all()
        for u in universities:
            count = db.query(ArticleUniversity).filter(ArticleUniversity.university_id == u.id).count()
            if count > 0:
                univ_stats.append({
                    "name": u.short_name,
                    "full_name": u.name,
                    "count": count
                })
        univ_stats.sort(key=lambda x: x["count"], reverse=True)

        # 4. Sentiment Breakdown
        pos_count = db.query(SentimentAnalysis).filter(SentimentAnalysis.sentiment == "Positive").count()
        neu_count = db.query(SentimentAnalysis).filter(SentimentAnalysis.sentiment == "Neutral").count()
        neg_count = db.query(SentimentAnalysis).filter(SentimentAnalysis.sentiment == "Negative").count()
        sentiment_distribution = [
            {"name": "Positif", "value": pos_count, "color": "#10b981"},
            {"name": "Netral", "value": neu_count, "color": "#64748b"},
            {"name": "Negatif", "value": neg_count, "color": "#ef4444"}
        ]

        # 5. Category Distribution
        category_stats = []
        categories = db.query(Category).all()
        for c in categories:
            c_count = db.query(ArticleCategory).filter(ArticleCategory.category_id == c.id).count()
            if c_count > 0:
                category_stats.append({
                    "name": c.name,
                    "count": c_count
                })
        category_stats.sort(key=lambda x: x["count"], reverse=True)

        # 6. Coverage by Media Source
        source_stats = []
        sources = db.query(Source).all()
        for s in sources:
            s_count = db.query(Article).filter(Article.source_id == s.id).count()
            if s_count > 0:
                source_stats.append({
                    "name": s.name,
                    "count": s_count
                })
        source_stats.sort(key=lambda x: x["count"], reverse=True)

        # 7. Trending Topics with Recency Decay & Trend Direction
        now_dt = datetime.datetime.utcnow()
        recent_articles_topics = db.query(Article.title, Article.content, Article.created_at).filter(
            Article.created_at >= (now_dt - datetime.timedelta(days=7))
        ).all()

        weighted_counter = Counter()
        prev_weighted_counter = Counter()
        midpoint_dt = now_dt - datetime.timedelta(days=3.5)

        for t, c, created_at in recent_articles_topics:
            text = f"{t} {c}"
            cleaned = clean_text(text)
            tokens = set(w for w in cleaned.split() if len(w) > 3 and w not in ALL_STOPWORDS)

            # Weight more recent articles higher
            recency_days = max(0.1, (now_dt - (created_at or now_dt)).total_seconds() / 86400.0)
            decay_weight = 1.0 / (1.0 + 0.2 * recency_days)

            for token in tokens:
                weighted_counter[token] += decay_weight
                if created_at and created_at < midpoint_dt:
                    prev_weighted_counter[token] += decay_weight

        trending_keywords = []
        for word, val in weighted_counter.most_common(12):
            prev_val = prev_weighted_counter.get(word, 0)
            direction = "up" if val >= prev_val * 1.2 else ("down" if val < prev_val * 0.8 else "stable")
            trending_keywords.append({
                "text": word.upper(),
                "topic": word.capitalize(),
                "value": int(round(val * 10)),
                "count": int(round(val * 10)),
                "trend_direction": direction
            })

        return {
            "total_articles": total_articles,
            "relevant_articles": relevant_articles,
            "volume_trend": volume_trend,
            "share_of_voice": univ_stats,
            "sentiment_distribution": sentiment_distribution,
            "category_distribution": category_stats,
            "source_distribution": source_stats,
            "trending_keywords": trending_keywords
        }
    finally:
        db.close()
