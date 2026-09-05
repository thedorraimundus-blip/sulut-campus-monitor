from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.database import get_db
from app.database.models import CrawlLog, SystemLog, Source, Article
from app.database.schemas import CrawlLogOut, SystemLogOut
from app.services.crawler.manager import crawler_manager
from app.ai.model_manager import model_manager
from app.workers.scheduler import monitoring_scheduler
from app.api.ws import ws_manager

router = APIRouter(prefix="/monitoring", tags=["Monitoring"])


@router.get("/status")
def get_monitoring_system_status(db: Session = Depends(get_db)):
    """Return health and status of all core subsystems."""
    last_src = db.query(Source).filter(Source.last_crawled != None).order_by(desc(Source.last_crawled)).first()
    last_crawl = str(last_src.last_crawled) if last_src else None

    active_sources_cnt = db.query(Source).filter(Source.is_active == True).count()
    articles_discovered = db.query(Article).count()
    articles_analyzed = db.query(Article).filter(Article.is_relevant != None).count()
    crawl_errors = db.query(CrawlLog).filter(CrawlLog.status.in_(["FAILED", "BLOCKED", "ERROR"])).count()

    sched_status = monitoring_scheduler.get_status()

    # Global monitoring status: RUNNING, IDLE, ERROR
    if crawler_manager.is_crawling:
        global_status = "RUNNING"
    elif not monitoring_scheduler.is_running:
        global_status = "IDLE"
    else:
        global_status = "RUNNING"

    return {
        "status": global_status,
        "global_status": global_status,
        "crawler": "Running" if crawler_manager.is_crawling else "Ready",
        "ai_engine": f"Ready ({model_manager.active_version})",
        "database": "Connected",
        "scheduler": "Running" if monitoring_scheduler.is_running else "Stopped",
        "scheduler_details": sched_status,
        "active_sources": active_sources_cnt,
        "last_crawl": last_crawl,
        "next_crawl": sched_status.get("next_run"),
        "articles_discovered": articles_discovered,
        "articles_analyzed": articles_analyzed,
        "crawl_errors": crawl_errors,
        "websocket": f"Connected ({len(ws_manager.active_connections)} clients)",
        "scheduler_running": monitoring_scheduler.is_running
    }


@router.post("/sources/{source_id}/crawl")
async def manual_crawl_source(
    source_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Trigger manual crawl for a single media source.
    Executes in background task to avoid blocking HTTP worker.
    """
    src = db.query(Source).filter(Source.id == source_id).first()
    if not src:
        raise HTTPException(status_code=404, detail=f"Source {source_id} not found")

    background_tasks.add_task(crawler_manager.crawl_source, source_id)
    return {
        "status": "QUEUED",
        "source_id": source_id,
        "source_name": src.name,
        "message": f"Crawling job queued for {src.name}."
    }


@router.post("/crawl-all")
async def manual_crawl_all(background_tasks: BackgroundTasks):
    """
    Trigger manual crawl across all active registered media sources.
    """
    background_tasks.add_task(crawler_manager.crawl_all_active_sources)
    return {
        "status": "QUEUED",
        "message": "Crawling job queued across all active media sources."
    }


@router.get("/logs", response_model=List[CrawlLogOut])
@router.get("/crawl-logs", response_model=List[CrawlLogOut])
def get_crawl_logs(limit: int = 50, db: Session = Depends(get_db)):
    """Fetch recent crawler run audit records."""
    logs = db.query(CrawlLog).order_by(desc(CrawlLog.created_at)).limit(limit).all()
    results = []
    for l in logs:
        results.append({
            "id": l.id,
            "source_id": l.source_id,
            "source_name": l.source.name if l.source else None,
            "status": l.status,
            "articles_found": l.articles_found,
            "articles_new": l.articles_new,
            "error_message": l.error_message,
            "duration_ms": l.duration_ms,
            "created_at": l.created_at
        })
    return results


@router.get("/system-logs", response_model=List[SystemLogOut])
def get_system_logs(
    level: str = Query(None, description="Filter by log level: INFO, WARNING, ERROR"),
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Fetch system activity and audit logs."""
    q = db.query(SystemLog)
    if level:
        q = q.filter(SystemLog.level == level.upper())
    logs = q.order_by(desc(SystemLog.created_at)).limit(limit).all()
    return logs
