import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["system"] == "SULUT CAMPUS MONITOR"
    assert data["status"] == "ONLINE"


def test_dashboard_stats():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_articles" in data
    assert "relevant_articles" in data
    assert "monitored_universities" in data
    assert data["monitored_universities"] > 0


def test_list_articles():
    response = client.get("/api/articles")
    assert response.status_code == 200
    arts = response.json()
    assert isinstance(arts, list)
    assert len(arts) > 0
    # Verify article item schema
    art = arts[0]
    assert "title" in art
    assert "url" in art
    assert "relevance_score" in art


def test_list_universities():
    response = client.get("/api/universities")
    assert response.status_code == 200
    univs = response.json()
    assert isinstance(univs, list)
    short_names = [u["short_name"] for u in univs]
    assert "UNSRAT" in short_names
    assert "UNIMA" in short_names


def test_list_sources():
    response = client.get("/api/sources")
    assert response.status_code == 200
    sources = response.json()
    assert isinstance(sources, list)
    names = [s["name"] for s in sources]
    assert "Manado Post" in names


def test_analytics_endpoint():
    response = client.get("/api/analytics?days=14")
    assert response.status_code == 200
    data = response.json()
    assert "volume_trend" in data
    assert "share_of_voice" in data
    assert "sentiment_distribution" in data


def test_ai_status():
    response = client.get("/api/ai/status")
    assert response.status_code == 200
    data = response.json()
    assert "model_version" in data
    assert "accuracy" in data


def test_monitoring_status():
    response = client.get("/api/monitoring/status")
    assert response.status_code == 200
    data = response.json()
    assert data["database"] == "Connected"


def test_auth_login():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
