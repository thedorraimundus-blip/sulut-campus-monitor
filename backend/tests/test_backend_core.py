import pytest
import datetime
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    """Test GET /api/health returns healthy status and SQLite connection."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["database"] == "Connected"
    assert "Sulut" in data["system"] or "SULUT" in data["system"]

def test_dashboard_stats():
    """Test GET /api/dashboard/stats returns required statistics."""
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200
    data = res.json()
    assert "total_articles" in data
    assert "articles_today" in data
    assert "total_universities" in data
    assert "active_sources" in data

def test_dashboard_trends():
    """Test GET /api/dashboard/trends returns daily volume data."""
    res = client.get("/api/dashboard/trends?days=7")
    assert res.status_code == 200
    data = res.json()
    assert "volume_trend" in data
    assert len(data["volume_trend"]) == 7

def test_dashboard_sentiment():
    """Test GET /api/dashboard/sentiment returns polarity summary."""
    res = client.get("/api/dashboard/sentiment")
    assert res.status_code == 200
    data = res.json()
    assert "distribution" in data
    assert "positive" in data
    assert "neutral" in data
    assert "negative" in data

def test_categories_endpoint():
    """Test GET /api/categories returns higher ed categories."""
    res = client.get("/api/categories")
    assert res.status_code == 200
    cats = res.json()
    assert isinstance(cats, list)
    cat_names = [c["name"] for c in cats]
    assert "Pendidikan" in cat_names
    assert "Penelitian" in cat_names

def test_universities_crud():
    """Test GET /api/universities, GET /api/universities/{id}, and POST /api/universities."""
    # List
    res = client.get("/api/universities")
    assert res.status_code == 200
    univs = res.json()
    assert len(univs) > 0
    first_id = univs[0]["id"]

    # Detail
    res_detail = client.get(f"/api/universities/{first_id}")
    assert res_detail.status_code == 200
    assert res_detail.json()["id"] == first_id

    # Create new test university
    test_univ = {
        "name": f"Institut Teknologi Minahasa Test {datetime.datetime.utcnow().timestamp()}",
        "short_name": "ITM-TEST",
        "description": "Kampus riset teknologi uji coba di Minahasa.",
        "website": "https://itm-test.ac.id",
        "city": "Tomohon",
        "is_active": True,
        "aliases": ["ITM Test", "Kampus ITM"]
    }
    res_create = client.post("/api/universities", json=test_univ)
    assert res_create.status_code in [200, 201]
    created = res_create.json()
    assert created["short_name"] == "ITM-TEST"

def test_sources_crud():
    """Test GET /api/sources, GET /api/sources/{id}, POST /api/sources, PUT, and DELETE."""
    # List
    res = client.get("/api/sources")
    assert res.status_code == 200
    sources = res.json()
    assert len(sources) > 0

    # Create new test source
    test_source = {
        "name": f"Sulut Media Portal Test {datetime.datetime.utcnow().timestamp()}",
        "url": "https://test-media-sulut.id",
        "source_type": "rss",
        "is_active": True,
        "monitoring_interval": 10
    }
    res_create = client.post("/api/sources", json=test_source)
    assert res_create.status_code in [200, 201]
    created = res_create.json()
    new_id = created["id"]
    assert created["name"] == test_source["name"]

    # Detail
    res_get = client.get(f"/api/sources/{new_id}")
    assert res_get.status_code == 200
    assert res_get.json()["id"] == new_id

    # Update
    res_update = client.put(f"/api/sources/{new_id}", json={"name": "Sulut Media Portal Updated"})
    assert res_update.status_code == 200
    assert res_update.json()["name"] == "Sulut Media Portal Updated"

    # Delete
    res_del = client.delete(f"/api/sources/{new_id}")
    assert res_del.status_code == 200
    assert res_del.json()["message"] == "Source deleted"

def test_articles_crud_and_duplicate_prevention():
    """Test GET /api/articles with filters, GET /{id}, POST /articles with duplicate detection."""
    # List with pagination & query
    res = client.get("/api/articles?page=1&limit=5")
    assert res.status_code == 200
    articles = res.json()
    assert isinstance(articles, list)

    # Filter with university and sort
    res_filter = client.get("/api/articles?university=UNSRAT&sort=newest&limit=3")
    assert res_filter.status_code == 200

    # Create new article
    unique_token = str(datetime.datetime.utcnow().timestamp())
    new_art = {
        "title": f"Mahasiswa UNSRAT Raih Medali Emas Kompetisi Sains {unique_token}",
        "url": f"https://manadopost.id/berita/sains-emas-{unique_token}",
        "content": f"Mahasiswa Universitas Sam Ratulangi berhasil menorehkan prestasi gemilang tingkat nasional {unique_token}.",
        "author": "Redaksi Manado Post",
        "is_relevant": True,
        "relevance_score": 92.5
    }
    res_post = client.post("/api/articles", json=new_art)
    assert res_post.status_code in [200, 201]
    created_art = res_post.json()
    art_id = created_art["id"]
    assert created_art["title"] == new_art["title"]

    # Detail
    res_detail = client.get(f"/api/articles/{art_id}")
    assert res_detail.status_code == 200
    assert res_detail.json()["content_hash"] is not None

    # Test Duplicate Prevention (same URL) -> Should return 409
    res_dup_url = client.post("/api/articles", json=new_art)
    assert res_dup_url.status_code == 409

    # Test Duplicate Prevention (different URL, identical content_hash) -> Should return 409
    dup_content_art = dict(new_art)
    dup_content_art["url"] = f"https://tribunmanado.co.id/berita/sains-emas-mirror-{unique_token}"
    res_dup_content = client.post("/api/articles", json=dup_content_art)
    assert res_dup_content.status_code == 409

def test_alerts_endpoint():
    """Test GET /api/alerts returns alerts list."""
    res = client.get("/api/alerts")
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_openapi_docs_accessible():
    """Test /docs and /openapi.json Swagger documentation accessibility."""
    res_openapi = client.get("/openapi.json")
    assert res_openapi.status_code == 200
    doc = res_openapi.json()
    assert "/api/health" in doc["paths"]
    assert "/api/articles" in doc["paths"]
    assert "/api/universities" in doc["paths"]
    assert "/api/sources" in doc["paths"]
    assert "/api/categories" in doc["paths"]
    assert "/api/dashboard/stats" in doc["paths"]
