from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import Source, Article
from app.database.schemas import SourceOut, SourceCreate, SourceUpdate, SourceTestRequest, SourceTestResult
from app.api.deps import require_admin
from app.services.crawler.validator import is_safe_url, normalize_url
from app.services.crawler.robots import is_allowed_by_robots
from app.services.crawler.rss_parser import discover_rss_feed, parse_rss_feed
from app.services.crawler.engine import crawler_engine
from app.services.crawler.manager import crawler_manager

router = APIRouter(prefix="/sources", tags=["Sources"])


def format_source(s: Source, db: Session) -> dict:
    total_arts = db.query(Article).filter(Article.source_id == s.id).count()
    rel_arts = db.query(Article).filter(Article.source_id == s.id, Article.is_relevant == True).count()
    return {
        "id": s.id,
        "name": s.name,
        "base_url": s.base_url,
        "rss_url": s.rss_url,
        "source_type": s.source_type,
        "is_active": s.is_active,
        "crawl_interval": s.crawl_interval,
        "last_crawled": s.last_crawled,
        "status": s.status,
        "error_count": s.error_count,
        "created_at": s.created_at,
        "article_count": total_arts,
        "relevant_count": rel_arts
    }


@router.get("", response_model=List[SourceOut])
def list_sources(db: Session = Depends(get_db)):
    """List all registered news sources with live crawl health."""
    sources = db.query(Source).all()
    return [format_source(s, db) for s in sources]


@router.get("/{source_id}", response_model=SourceOut)
def get_source_detail(source_id: int, db: Session = Depends(get_db)):
    """Retrieve details of a single media source by ID."""
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    return format_source(source, db)


@router.post("/test", response_model=SourceTestResult)
async def test_source(data: SourceTestRequest):
    """
    Test a candidate source URL before saving:
    1. Validate URL & SSRF safety.
    2. Check robots.txt permissions.
    3. Detect RSS/Atom feed.
    4. Estimate sample articles.
    """
    safe, msg = is_safe_url(data.url)
    if not safe:
        return {
            "valid_url": False,
            "robots_allowed": False,
            "rss_detected": False,
            "rss_url": None,
            "sample_articles_found": 0,
            "message": f"URL tidak valid atau melanggar aturan keamanan: {msg}"
        }

    robots_ok = await is_allowed_by_robots(data.url)
    if not robots_ok:
        return {
            "valid_url": True,
            "robots_allowed": False,
            "rss_detected": False,
            "rss_url": None,
            "sample_articles_found": 0,
            "message": "Akses diblokir oleh robots.txt domain target."
        }

    # Detect RSS
    detected_rss = data.rss_url
    if not detected_rss:
        detected_rss = await discover_rss_feed(data.url)

    sample_count = 0
    if detected_rss:
        items = await parse_rss_feed(detected_rss)
        sample_count = len(items)

    msg_status = (
        f"✓ URL Valid, ✓ Robots.txt OK, ✓ RSS Terdeteksi ({sample_count} artikel ditemukan)"
        if detected_rss
        else "✓ URL Valid, ✓ Robots.txt OK, ⚠ RSS tidak ditemukan (HTML Crawler fallback siap digunakan)"
    )

    return {
        "valid_url": True,
        "robots_allowed": robots_ok,
        "rss_detected": bool(detected_rss),
        "rss_url": detected_rss,
        "sample_articles_found": sample_count,
        "message": msg_status
    }


@router.post("", response_model=SourceOut, status_code=201)
def create_source(
    data: SourceCreate,
    db: Session = Depends(get_db)
):
    """Register a new news or campus portal source."""
    raw_url = data.base_url or data.url
    if not raw_url:
        raise HTTPException(status_code=400, detail="base_url or url is required")

    safe, msg = is_safe_url(raw_url)
    if not safe:
        raise HTTPException(status_code=400, detail=msg)

    interval = data.crawl_interval or data.monitoring_interval or 5

    source = Source(
        name=data.name,
        base_url=normalize_url(raw_url),
        rss_url=data.rss_url,
        source_type=data.source_type or "rss",
        is_active=data.is_active if data.is_active is not None else True,
        crawl_interval=interval,
        status="IDLE"
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    return format_source(source, db)


@router.put("/{source_id}", response_model=SourceOut)
def update_source(
    source_id: int,
    data: SourceUpdate,
    db: Session = Depends(get_db)
):
    """Update source configuration."""
    src = db.query(Source).filter(Source.id == source_id).first()
    if not src:
        raise HTTPException(status_code=404, detail="Source not found")

    if data.name is not None:
        src.name = data.name
    raw_url = data.base_url or data.url
    if raw_url is not None:
        safe, msg = is_safe_url(raw_url)
        if not safe:
            raise HTTPException(status_code=400, detail=msg)
        src.base_url = normalize_url(raw_url)
    if data.rss_url is not None:
        src.rss_url = data.rss_url
    if data.source_type is not None:
        src.source_type = data.source_type
    if data.is_active is not None:
        src.is_active = data.is_active
    interval = data.crawl_interval or data.monitoring_interval
    if interval is not None:
        src.crawl_interval = interval

    db.commit()
    db.refresh(src)
    return format_source(src, db)


@router.delete("/{source_id}")
def delete_source(
    source_id: int,
    db: Session = Depends(get_db)
):
    """Delete a media source."""
    src = db.query(Source).filter(Source.id == source_id).first()
    if not src:
        raise HTTPException(status_code=404, detail="Source not found")
    db.delete(src)
    db.commit()
    return {"message": "Source deleted"}


@router.post("/{source_id}/scan")
@router.post("/{source_id}/crawl")
async def scan_single_source(source_id: int, background_tasks: BackgroundTasks):
    """Trigger an immediate background crawl for a specific source."""
    background_tasks.add_task(crawler_manager.crawl_source, source_id)
    return {"message": f"Crawl initiated for source {source_id}", "status": "PENDING"}


@router.post("/scan-all")
@router.post("/crawl-all")
async def scan_all_sources(background_tasks: BackgroundTasks):
    """Trigger an immediate background crawl across all active sources."""
    background_tasks.add_task(crawler_manager.crawl_all_active_sources)
    return {"message": "Full crawler cycle initiated for all active sources", "status": "PENDING"}
