import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.database import get_db
from app.config import settings

from app.services.crawler.manager import crawler_manager
from app.workers.scheduler import monitoring_scheduler
from app.ai.model_manager import model_manager

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Return operational health status of backend and SQLite connection."""
    db_status = "Connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"Error: {str(e)}"

    return {
        "status": "healthy",
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
        "scheduler": "running" if monitoring_scheduler.is_running else "stopped",
        "crawler": "running" if crawler_manager.is_crawling else "ready",
        "ai": "ready",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
