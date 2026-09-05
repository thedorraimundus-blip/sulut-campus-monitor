import pytest
import datetime
from unittest.mock import patch, AsyncMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.database.database import Base
from app.database.models import (
    Source, Article, University, UniversityAlias, Category,
    SentimentAnalysis, AIPrediction, Alert, CrawlLog
)
from app.services.crawler.manager import CrawlerManager
from app.ai.entity_detector import entity_detector
from app.ai.pipeline import analyze_article

client = TestClient(app)


@pytest.mark.asyncio
async def test_full_pipeline_crawl_to_ai_to_alerts_to_api(monkeypatch):
    """
    End-to-End Acceptance Test:
    Media Source -> Crawler -> Article Extraction -> Deduplication -> SQLite
    -> Local AI Analysis -> Relevance & University & Category & Sentiment & Summary
    -> Alert Generation -> Dashboard & Live Monitor API.
    """
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSession()

    try:
        # 1. Seed categories and universities
        cat_prestasi = Category(name="Prestasi", description="Prestasi")
        cat_pendidikan = Category(name="Pendidikan", description="Pendidikan")
        db.add_all([cat_prestasi, cat_pendidikan])

        univ_unsrat = University(name="Universitas Sam Ratulangi", short_name="UNSRAT", is_active=True)
        db.add(univ_unsrat)
        db.commit()

        alias = UniversityAlias(university_id=univ_unsrat.id, alias="UNSRAT")
        db.add(alias)
        db.commit()

        # Update entity detector cache for isolation
        entity_detector.cached_universities = [{
            "id": univ_unsrat.id,
            "name": univ_unsrat.name,
            "short_name": univ_unsrat.short_name,
            "aliases": [univ_unsrat.name, univ_unsrat.short_name, "UNSRAT"]
        }]

        # 2. Add Media Source
        source = Source(
            name="Manado Post Test",
            base_url="https://manadopost.example.com",
            rss_url="https://manadopost.example.com/feed.xml",
            source_type="rss",
            crawl_interval=5,
            is_active=True,
            status="IDLE"
        )
        db.add(source)
        db.commit()
        db.refresh(source)
        source_id = source.id

        sample_feed = """<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Manado Post</title>
            <item>
              <title>Mahasiswa Unsrat Manado Raih Medali Emas Olimpiade Sains Nasional</title>
              <link>https://manadopost.example.com/unsrat-emas-osn-2026</link>
              <description><![CDATA[Prestasi luar biasa membanggakan ditorehkan mahasiswa Universitas Sam Ratulangi (Unsrat) Manado dengan menyabet juara pertama dan medali emas olimpiade sains nasional.]]></description>
              <pubDate>Sat, 05 Sep 2026 12:00:00 +0800</pubDate>
            </item>
          </channel>
        </rss>
        """

        # 3. Execute Crawler
        monkeypatch.setattr("app.services.crawler.manager.SessionLocal", lambda: db)
        monkeypatch.setattr("app.services.crawler.manager.is_allowed_by_robots", AsyncMock(return_value=True))

        mgr = CrawlerManager()
        monkeypatch.setattr(mgr.rss_crawler, "fetch", AsyncMock(return_value=sample_feed))

        crawl_res = await mgr.crawl_source(source_id)

        assert crawl_res["status"] == "SUCCESS"
        assert crawl_res["articles_found"] == 1
        assert crawl_res["articles_new"] == 1

        # 4. Verify Article Persisted in SQLite
        saved_article = db.query(Article).filter(Article.source_id == source_id).first()
        assert saved_article is not None
        assert "Unsrat" in saved_article.title
        assert saved_article.content_hash is not None

        # 5. Verify Automatic AI Processing Result
        assert saved_article.is_relevant is True
        assert saved_article.relevance_score >= 60.0
        assert saved_article.summary is not None
        assert len(saved_article.summary) > 0

        # Check linked university
        assert len(saved_article.universities) >= 1
        assert saved_article.universities[0].university.short_name == "UNSRAT"

        # Check category link
        assert len(saved_article.categories) >= 1

        # Check sentiment
        assert saved_article.sentiment is not None
        assert saved_article.sentiment.sentiment in ["Positive", "Neutral"]

        # 6. Check Granular AI Predictions
        preds = db.query(AIPrediction).filter(AIPrediction.article_id == saved_article.id).all()
        assert len(preds) >= 3

        # 7. Check Automated Alert Creation (e.g. High Relevance)
        alert = db.query(Alert).filter(Alert.article_id == saved_article.id).first()
        if saved_article.relevance_score >= 90.0:
            assert alert is not None
            assert alert.alert_type in ["HIGH_RELEVANCE", "NEGATIVE_SENTIMENT"]

    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


def test_health_endpoint_subsystem_status():
    """Verify /api/health reports backend, database, scheduler, crawler, and AI statuses."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["database"] == "Connected"
    assert data["scheduler"] in ["running", "stopped"]
    assert data["crawler"] in ["ready", "running"]
    assert data["ai"] == "ready"


def test_dashboard_stats_real_query():
    """Verify /api/dashboard/stats returns correct live KPI structure."""
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200
    data = res.json()
    assert "total_articles" in data
    assert "articles_today" in data
    assert "monitored_universities" in data
    assert "active_sources" in data


def test_monitoring_status_endpoint():
    """Verify /api/monitoring/status returns live monitoring overview."""
    res = client.get("/api/monitoring/status")
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert "active_sources" in data
    assert "crawler" in data
    assert "scheduler" in data


def test_sentiment_confirmation_and_alerts_traceability():
    """
    Verify:
    1. Sentiment confirmation endpoint persists status (CONFIRMED / REJECTED)
    2. Alert traceability includes source_name, article_title, article_url
    3. Cron crawl-due endpoint behaves safely
    """
    # 1. Test Sentiment confirmation on an existing or created article
    articles_res = client.get("/api/articles?limit=1")
    assert articles_res.status_code == 200
    articles = articles_res.json()

    if articles:
        test_art_id = articles[0]["id"]
        conf_res = client.post(
            f"/api/articles/{test_art_id}/sentiment-confirmation",
            json={"status": "CONFIRMED", "sentiment": "Negative", "confirmed_by": "TestReviewer"}
        )
        assert conf_res.status_code == 200
        conf_data = conf_res.json()
        assert conf_data["sentiment"]["confirmation_status"] == "CONFIRMED"
        assert conf_data["sentiment"]["confirmed_by"] == "TestReviewer"

        # Verify article detail retrieval preserves confirmation
        det_res = client.get(f"/api/articles/{test_art_id}")
        assert det_res.status_code == 200
        assert det_res.json()["sentiment"]["confirmation_status"] == "CONFIRMED"

    # 2. Test Alerts endpoint traceability structure
    alerts_res = client.get("/api/alerts?limit=5")
    assert alerts_res.status_code == 200
    alerts_data = alerts_res.json()
    for item in alerts_data:
        assert "source_name" in item
        assert "article_title" in item
        assert "article_url" in item

    # 3. Test Cron endpoint
    cron_res = client.post("/api/cron/crawl-due", headers={"Authorization": "Bearer sulut-campus-monitor-cron-secret-2026"})
    assert cron_res.status_code == 200
    assert cron_res.json()["status"] == "QUEUED"
