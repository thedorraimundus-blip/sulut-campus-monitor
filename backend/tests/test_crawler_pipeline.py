import pytest
import datetime
from unittest.mock import patch, AsyncMock
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.database import Base
from app.database.models import Source, CrawlLog, Article
from app.services.crawler.validator import is_safe_url, normalize_url
from app.services.crawler.article_extractor import clean_text, generate_excerpt, extract_article
from app.services.crawler.deduplicator import Deduplicator, compute_content_hash
from app.services.crawler.rss_crawler import RSSCrawler
from app.services.crawler.html_crawler import HTMLCrawler
from app.services.crawler.manager import CrawlerManager


# In-memory SQLite fixture for isolated unit tests
@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


def test_url_normalization():
    """Verify URL normalization removes tracking queries, fragments, and trailing slashes."""
    url = "https://manadopost.jawapos.com/pendidikan/berita-unsrat/?utm_source=facebook&utm_medium=cpc&ref=xyz#comments"
    norm = normalize_url(url)
    assert norm == "https://manadopost.jawapos.com/pendidikan/berita-unsrat"


def test_ssrf_safety_validation():
    """Verify private IPs and loopback addresses are flagged and blocked."""
    safe, _ = is_safe_url("http://127.0.0.1:8000/admin")
    assert safe is False

    safe, _ = is_safe_url("http://localhost:3000")
    assert safe is False

    safe, _ = is_safe_url("https://beritamanado.com/pendidikan")
    assert safe is True


def test_content_hash_and_deduplication(db_session):
    """Verify SHA-256 content hashing detects duplicate articles."""
    title = "Unsrat Manado Buka Program Studi Baru Tahun 2026"
    content = "Universitas Sam Ratulangi (Unsrat) Manado meresmikan program studi kecerdasan buatan."
    h1 = compute_content_hash(title, content)
    h2 = compute_content_hash("  unsrat manado buka program studi baru tahun 2026  ", content)
    assert h1 == h2

    # Save first article
    art = Article(
        title=title,
        url="https://example.com/unsrat-baru",
        content=content,
        content_hash=h1,
        is_relevant=None,
        relevance_score=None
    )
    db_session.add(art)
    db_session.commit()

    # Check duplicate by URL
    is_dup, _, reason = Deduplicator.is_duplicate(db_session, "https://example.com/unsrat-baru", "diff-hash")
    assert is_dup is True
    assert "URL" in reason

    # Check duplicate by Content Hash
    is_dup2, _, reason2 = Deduplicator.is_duplicate(db_session, "https://example.com/syndicated-url", h1)
    assert is_dup2 is True
    assert "content hash" in reason2


def test_article_cleaner_and_excerpt():
    """Verify noise patterns removal and clean excerpt generation."""
    raw = (
        "Baca juga: Berita viral kemarin\n\n"
        "Rektor Unsrat memimpin langsung wisuda gelombang pertama tahun 2026 di Auditorium Manado.\n\n"
        "Copyright 2026 Media Manado. Hak cipta dilindungi undang-undang.\n\n"
        "Sebanyak 1.500 lulusan resmi menyandang gelar sarjana hari ini."
    )
    cleaned = clean_text(raw)
    assert "Baca juga" not in cleaned
    assert "Copyright" not in cleaned
    assert "Rektor Unsrat" in cleaned
    assert "1.500 lulusan" in cleaned

    excerpt = generate_excerpt(cleaned, max_chars=80)
    assert len(excerpt) <= 85
    assert excerpt.endswith("...")


def test_article_extractor_html_fallback():
    """Verify HTML extraction using BeautifulSoup fallback when trafilatura is not available or sparse."""
    sample_html = """
    <html>
      <head>
        <title>Wisuda Unsrat Berlangsung Meriah - Manado Post</title>
        <meta property="og:title" content="Wisuda Unsrat Berlangsung Meriah" />
        <meta name="author" content="Tim Redaksi" />
        <meta property="og:image" content="https://manadopost.jawapos.com/img/wisuda.jpg" />
      </head>
      <body>
        <nav><a href="/">Home</a></nav>
        <article>
          <p>Rektor Universitas Sam Ratulangi mewisuda 1.500 mahasiswa dalam upacara khidmat di Manado.</p>
          <p>Para wisudawan diharapkan dapat memberikan kontribusi nyata bagi pembangunan daerah Sulawesi Utara.</p>
        </article>
        <footer><p>Copyright 2026</p></footer>
      </body>
    </html>
    """
    extracted = extract_article(sample_html, "https://manadopost.jawapos.com/wisuda-unsrat")
    assert "Wisuda Unsrat" in extracted["title"]
    assert "Tim Redaksi" in extracted["author"]
    assert "1.500 mahasiswa" in extracted["content"]
    assert "https://manadopost.jawapos.com/img/wisuda.jpg" in extracted["image_url"]


@pytest.mark.asyncio
async def test_rss_crawler_parse_feed():
    """Verify RSSCrawler parses RSS XML and normalizes entries."""
    sample_rss_xml = """<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>Berita Sulut News</title>
        <link>https://sulutnews.example.com</link>
        <item>
          <title>Politeknik Negeri Manado Kembangkan Riset Energi Terbarukan</title>
          <link>https://sulutnews.example.com/polimdo-riset?utm_source=rss</link>
          <description><![CDATA[Tim peneliti Polimdo berhasil menciptakan turbin angin hemat energi.]]></description>
          <author>Redaksi Polimdo</author>
          <pubDate>Mon, 05 Sep 2026 10:00:00 +0800</pubDate>
        </item>
      </channel>
    </rss>
    """
    crawler = RSSCrawler()
    with patch.object(crawler, "fetch", new_callable=AsyncMock, return_value=sample_rss_xml):
        items = await crawler.parse_feed("https://sulutnews.example.com/rss.xml")
        assert len(items) == 1
        entry = items[0]
        assert "Politeknik Negeri Manado" in entry["title"]
        assert entry["url"] == "https://sulutnews.example.com/polimdo-riset"
        assert "turbin angin" in entry["summary"]


@pytest.mark.asyncio
async def test_html_crawler_discover_links():
    """Verify HTMLCrawler gathers article links and ignores nav/tags."""
    sample_homepage_html = """
    <html>
      <head><title>Portal Berita Manado</title></head>
      <body>
        <nav>
          <a href="/category/pendidikan">Kategori Pendidikan</a>
          <a href="/tag/sulut">Tag Sulut</a>
        </nav>
        <main>
          <a href="/berita/mahasiswa-unsrat-lolos-pkm-nasional">Mahasiswa Unsrat Lolos Seleksi Program PKM Nasional</a>
          <a href="/berita/rektor-unima-resmikan-gedung-lab">Rektor Unima Resmikan Laboratorium Baru Kampus Tondano</a>
          <a href="/about">Tentang Kami</a>
        </main>
      </body>
    </html>
    """
    crawler = HTMLCrawler()
    with patch.object(crawler, "fetch", new_callable=AsyncMock, return_value=sample_homepage_html):
        links = await crawler.discover_article_links("https://portalmanado.example.com")
        assert len(links) == 2
        titles = [l["title"] for l in links]
        assert any("Mahasiswa Unsrat" in t for t in titles)
        assert any("Rektor Unima" in t for t in titles)


@pytest.mark.asyncio
async def test_crawler_manager_crawl_source_flow(db_session, monkeypatch):
    """
    Verify complete CrawlerManager cycle:
    Source -> RSS fetch -> extract -> deduplicate -> save raw article -> write crawl_log.
    """
    # Create test source
    source = Source(
        name="Sulut Edu Portal",
        base_url="https://edusulut.example.com",
        rss_url="https://edusulut.example.com/feed.xml",
        source_type="rss",
        is_active=True,
        status="IDLE"
    )
    db_session.add(source)
    db_session.commit()
    db_session.refresh(source)

    sample_rss_xml = """<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>Edu Sulut</title>
        <item>
          <title>Kampus IAIN Manado Gelar Seminar Internasional Moderasi Beragama</title>
          <link>https://edusulut.example.com/iain-seminar-2026</link>
          <description><![CDATA[IAIN Manado menyelenggarakan konferensi akademik bersama pembicara dari berbagai negara sahabat untuk memperkuat toleransi.]]></description>
        </item>
      </channel>
    </rss>
    """

    # Monkeypatch database SessionLocal in crawler manager
    monkeypatch.setattr("app.services.crawler.manager.SessionLocal", lambda: db_session)
    # Monkeypatch robots.txt allowance
    monkeypatch.setattr("app.services.crawler.manager.is_allowed_by_robots", AsyncMock(return_value=True))

    manager = CrawlerManager()
    # Mock fetching RSS XML
    monkeypatch.setattr(manager.rss_crawler, "fetch", AsyncMock(return_value=sample_rss_xml))

    # Run crawl
    source_id = source.id
    res = await manager.crawl_source(source_id)
    assert res["status"] == "SUCCESS"
    assert res["articles_found"] == 1
    assert res["articles_new"] == 1

    # Verify Article saved in database and evaluated by local AI
    saved_article = db_session.query(Article).filter(Article.source_id == source_id).first()
    assert saved_article is not None
    assert "IAIN Manado" in saved_article.title
    assert isinstance(saved_article.is_relevant, bool)

    # Verify CrawlLog recorded
    log = db_session.query(CrawlLog).filter(CrawlLog.source_id == source_id).first()
    assert log is not None
    assert log.status == "SUCCESS"
    assert log.articles_found == 1
    assert log.articles_new == 1


@pytest.mark.asyncio
async def test_crawler_manager_blocks_disallowed_robots(db_session, monkeypatch):
    """Verify CrawlerManager records BLOCKED in crawl_logs when robots.txt denies access."""
    source = Source(
        name="Private News Site",
        base_url="https://private-news.example.com",
        source_type="html",
        is_active=True,
        status="IDLE"
    )
    db_session.add(source)
    db_session.commit()
    source_id = source.id

    monkeypatch.setattr("app.services.crawler.manager.SessionLocal", lambda: db_session)
    # Disallow via robots.txt
    monkeypatch.setattr("app.services.crawler.manager.is_allowed_by_robots", AsyncMock(return_value=False))

    manager = CrawlerManager()
    res = await manager.crawl_source(source_id)
    assert res["status"] == "BLOCKED"

    # Verify CrawlLog recorded as BLOCKED
    log = db_session.query(CrawlLog).filter(CrawlLog.source_id == source_id).first()
    assert log is not None
    assert log.status == "BLOCKED"
