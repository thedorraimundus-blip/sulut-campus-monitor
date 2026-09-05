import pytest
import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.database.database import Base
from app.database.models import Article, Category, University, UniversityAlias, ModelVersion, AIPrediction, SentimentAnalysis
from app.ai.tokenizer import clean_text, tokenize, remove_stopwords, stem_word, preprocess_text
from app.ai.relevance import calculate_relevance
from app.ai.entity_detector import entity_detector
from app.ai.sentiment import analyze_sentiment
from app.ai.summarizer import summarize_text, split_sentences
from app.ai.classifier import classify_category, classify_category_rule_based
from app.ai.pipeline import process_article_intelligence, analyze_article
from app.ai.model_manager import model_manager

client = TestClient(app)


def test_tokenizer_and_stemmer():
    text = "Mahasiswa Unsrat sedang mengembangkan inovasi teknologi kampus."
    tokens = tokenize(text)
    assert "mahasiswa" in tokens
    assert "unsrat" in tokens
    # Sastrawi stemmer
    stemmed = stem_word("mengembangkan")
    assert stemmed == "kembang"
    # Preprocess text
    prep = preprocess_text(text)
    assert "mahasiswa" in prep


def test_relevance_campus_vs_non_campus():
    # Campus article should score high and be relevant
    campus_title = "Universitas Sam Ratulangi Raih Penghargaan Nasional"
    campus_content = "Rektor Unsrat bersama para dosen dan mahasiswa menerima anugerah inovasi akademik tingkat nasional."
    is_rel, score, debug = calculate_relevance(campus_title, campus_content, ["Universitas Sam Ratulangi"])
    assert is_rel is True
    assert score >= 70.0
    assert 0.0 <= debug["confidence"] <= 1.0

    # Non-campus article should score low and NOT be relevant
    general_title = "Jalan Boulevard Manado Macet Parah Akibat Pohon Tumbang"
    general_content = "Petugas dinas perhubungan dan kepolisian menertibkan arus lalu lintas di pusat perbelanjaan Manado."
    is_rel2, score2, debug2 = calculate_relevance(general_title, general_content, [])
    assert is_rel2 is False
    assert score2 < 40.0
    assert 0.0 <= debug2["confidence"] <= 1.0


def test_university_entity_detector():
    text = "Rektor Unsrat bersama pimpinan Universitas Negeri Manado (UNIMA) menandatangani nota kesepahaman."
    detected = entity_detector.detect(text)
    univ_shorts = [u["short_name"] for u in detected]
    assert "UNSRAT" in univ_shorts
    assert "UNIMA" in univ_shorts
    for u in detected:
        assert 0.0 <= u["confidence_score"] <= 1.0


def test_sentiment_analyzer():
    pos_text = "Prestasi luar biasa! Mahasiswa sukses meraih juara satu dan membanggakan almamater."
    sent_pos, pos, neu, neg = analyze_sentiment(pos_text)
    assert sent_pos == "Positive"
    assert pos > neg

    neg_text = "Terjadi kericuhan dan aksi demo bentrok di gerbang rektorat, kejaksaan selidiki dugaan korupsi."
    sent_neg, pos_n, neu_n, neg_n = analyze_sentiment(neg_text)
    assert sent_neg == "Negative"
    assert neg_n > pos_n

    # Contextual check: negative word with negation should not trigger negative
    nuanced_text = "Kampus membantah adanya isu korupsi dan memastikan program beasiswa berjalan transparan."
    sent_nuanced, _, _, _ = analyze_sentiment(nuanced_text)
    assert sent_nuanced in ["Neutral", "Positive"]


def test_extractive_summarizer():
    long_text = (
        "Universitas Sam Ratulangi menggelar wisuda akbar tahun akademik baru di auditorium kampus. "
        "Sebanyak dua ribu lulusan sarjana dan pascasarjana resmi dilantik oleh rektor dalam suasana khidmat. "
        "Dalam pidatonya, Rektor berpesan agar para alumni selalu menjaga nama baik almamater dan berkontribusi nyata bagi masyarakat Sulawesi Utara. "
        "Acara wisuda dihadiri pula oleh keluarga wisudawan dan jajaran pejabat pemerintah provinsi."
    )
    sents = split_sentences(long_text)
    assert len(sents) >= 3

    summary = summarize_text(long_text, max_sentences=2)
    assert len(summary) > 0
    assert len(summary) <= len(long_text)


def test_category_classifier():
    news_text = "Tim mahasiswa Unsrat berhasil meraih medali emas dalam olimpiade sains nasional di Jakarta."
    cat, conf, ver = classify_category(news_text)
    assert cat in ["Prestasi", "Mahasiswa", "Pendidikan"]
    assert 0.0 <= conf <= 1.0


def test_ai_pipeline_in_memory():
    title = "Rektor Unsrat Kukuhkan Tiga Guru Besar Baru di Bidang Kelautan"
    content = "Universitas Sam Ratulangi (Unsrat) Manado menggelar sidang senat terbuka pengukuhan profesor baru. Para guru besar berkomitmen memperkuat riset kemaritiman di Sulawesi Utara."
    res = process_article_intelligence(title, content)
    assert res["is_relevant"] is True
    assert res["relevance_score"] >= 50.0
    assert 0.0 <= res["relevance_confidence"] <= 1.0
    assert len(res["detected_universities"]) >= 1
    assert res["detected_universities"][0]["short_name"] == "UNSRAT"
    assert res["category"] in ["Akademik", "Dosen", "Pendidikan", "Penelitian"]
    assert res["sentiment"] in ["Positive", "Neutral"]
    assert len(res["summary"]) > 0


def test_ai_pipeline_database_integration():
    """Verify analyze_article loads from DB, runs AI, and stores all granular predictions."""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSession()

    try:
        # Seed a test category & university
        cat = Category(name="Prestasi", description="Prestasi")
        db.add(cat)
        univ = University(name="Universitas Sam Ratulangi", short_name="UNSRAT", is_active=True)
        db.add(univ)
        db.commit()

        # Seed alias
        alias = UniversityAlias(university_id=univ.id, alias="UNSRAT")
        db.add(alias)
        db.commit()

        # Update entity detector cache for isolated test
        entity_detector.cached_universities = [{
            "id": univ.id,
            "name": univ.name,
            "short_name": univ.short_name,
            "aliases": [univ.name, univ.short_name, "UNSRAT"]
        }]

        # Create unanalyzed article
        art = Article(
            title="Mahasiswa Unsrat Boyong Medali Emas Robotika",
            url="https://example.com/unsrat-emas-robotika",
            content="Prestasi membanggakan kembali ditorehkan mahasiswa Universitas Sam Ratulangi (Unsrat). Tim riset berhasil menjuarai kontes robotika nasional.",
            content_hash="test-hash-12345",
            is_relevant=None,
            relevance_score=None
        )
        db.add(art)
        db.commit()
        db.refresh(art)

        # Run analysis pipeline
        result = analyze_article(art.id, db=db)
        assert result["success"] is True
        assert result["is_relevant"] is True
        assert result["relevance_score"] >= 60.0

        # Verify Article updated
        db.refresh(art)
        assert art.is_relevant is True
        assert art.relevance_score >= 60.0
        assert art.summary is not None

        # Verify predictions saved
        preds = db.query(AIPrediction).filter(AIPrediction.article_id == art.id).all()
        assert len(preds) >= 3  # relevance, category, sentiment, (optional entity)
        types = [p.prediction_type for p in preds]
        assert "relevance" in types
        assert "category" in types
        assert "sentiment" in types

        # Verify sentiment saved
        sent = db.query(SentimentAnalysis).filter(SentimentAnalysis.article_id == art.id).first()
        assert sent is not None
        assert sent.sentiment in ["Positive", "Neutral"]

    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


def test_ai_api_endpoints():
    """Verify newly added AI REST API endpoints return expected structure."""
    # 1. GET /api/ai/stats
    res = client.get("/api/ai/stats")
    assert res.status_code == 200
    data = res.json()
    assert "total_articles" in data
    assert "models" in data
    assert "category_classifier" in data["models"]

    # 2. GET /api/ai/models
    res_models = client.get("/api/ai/models")
    assert res_models.status_code == 200

    # 3. GET /api/ai/models/active
    res_model = client.get("/api/ai/models/active")
    assert res_model.status_code == 200
    assert "accuracy" in res_model.json()

    # 4. GET /api/ai/training-data
    res_data = client.get("/api/ai/training-data?limit=5")
    assert res_data.status_code == 200
