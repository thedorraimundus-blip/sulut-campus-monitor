import datetime
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.database import get_db
from app.database.models import (
    Article, University, Source, SentimentAnalysis
)
from app.database.schemas import DashboardStats, ArticleOut
from app.api.routes.articles import format_article_out
from app.services.crawler.engine import crawler_engine
from app.ai.model_manager import model_manager
from app.workers.scheduler import monitoring_scheduler

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_kpi_stats(db: Session = Depends(get_db)):
    """Fetch all high-level KPI counts for the main dashboard cards."""
    total_arts = db.query(Article).count()
    relevant_arts = db.query(Article).filter(Article.is_relevant == True).count()

    today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_arts = db.query(Article).filter(Article.created_at >= today_start).count()

    monitored_univs = db.query(University).filter(University.is_active == True).count()
    active_sources = db.query(Source).filter(Source.is_active == True).count()

    pos_count = db.query(SentimentAnalysis).filter(SentimentAnalysis.sentiment == "Positive").count()
    neu_count = db.query(SentimentAnalysis).filter(SentimentAnalysis.sentiment == "Neutral").count()
    neg_count = db.query(SentimentAnalysis).filter(SentimentAnalysis.sentiment == "Negative").count()

    crawler_status = "Crawling" if crawler_engine.is_crawling else "Ready"
    ai_status = f"Ready ({model_manager.active_version})"

    last_source = db.query(Source).filter(Source.last_crawled != None).order_by(desc(Source.last_crawled)).first()
    last_crawl_time = last_source.last_crawled if last_source else None

    return {
        "total_articles": total_arts,
        "today_articles": today_arts,
        "articles_today": today_arts,
        "total_universities": monitored_univs,
        "monitored_universities": monitored_univs,
        "active_sources": active_sources,
        "relevant_articles": relevant_arts,
        "positive_count": pos_count,
        "neutral_count": neu_count,
        "negative_count": neg_count,
        "crawler_status": crawler_status,
        "ai_engine_status": ai_status,
        "last_crawl_time": last_crawl_time
    }


@router.get("/trends")
def get_dashboard_trends(days: int = 14, db: Session = Depends(get_db)):
    """Fetch daily article publishing trends for charts."""
    since_date = datetime.datetime.utcnow() - datetime.timedelta(days=days)
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

    return {
        "days": days,
        "volume_trend": list(volume_by_day.values())
    }


@router.get("/sentiment")
def get_dashboard_sentiment(db: Session = Depends(get_db)):
    """Fetch sentiment distribution summary for dashboard donut chart."""
    pos_count = db.query(SentimentAnalysis).filter(SentimentAnalysis.sentiment == "Positive").count()
    neu_count = db.query(SentimentAnalysis).filter(SentimentAnalysis.sentiment == "Neutral").count()
    neg_count = db.query(SentimentAnalysis).filter(SentimentAnalysis.sentiment == "Negative").count()
    total = pos_count + neu_count + neg_count

    return {
        "total": total,
        "positive": pos_count,
        "neutral": neu_count,
        "negative": neg_count,
        "distribution": [
            {"name": "Positif", "value": pos_count, "color": "#10b981"},
            {"name": "Netral", "value": neu_count, "color": "#64748b"},
            {"name": "Negatif", "value": neg_count, "color": "#ef4444"}
        ]
    }


@router.get("/live", response_model=List[ArticleOut])
def get_live_monitor_feed(limit: int = 15, db: Session = Depends(get_db)):
    """Get the most recent stream of incoming campus articles for the live monitor."""
    articles = db.query(Article).order_by(desc(Article.created_at)).limit(limit).all()
    return [format_article_out(a) for a in articles]
