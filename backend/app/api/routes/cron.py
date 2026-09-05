import os
from fastapi import APIRouter, Header, HTTPException, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.workers.scheduler import monitoring_scheduler
from app.services.crawler.manager import crawler_manager
from app.utils.logger import logger

router = APIRouter(prefix="/cron", tags=["Cron"])

CRON_SECRET = os.getenv("CRON_SECRET", "sulut-campus-monitor-cron-secret-2026")


@router.post("/crawl-due")
@router.get("/crawl-due")
async def execute_serverless_cron_crawl(
    background_tasks: BackgroundTasks,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Secure cron endpoint for serverless architectures (e.g. Vercel Cron).
    Triggers crawling on sources that have exceeded their configured crawl_interval.
    Protected by CRON_SECRET authorization header to prevent unauthorized trigger floods.
    """
    token = ""
    if authorization:
        token = authorization.replace("Bearer ", "").strip()

    if token != CRON_SECRET and os.getenv("VERCEL_ENV") == "production":
        logger.warning("[Cron] Unauthorized cron invocation attempt blocked.")
        raise HTTPException(status_code=401, detail="Unauthorized cron trigger: invalid secret token")

    background_tasks.add_task(monitoring_scheduler._run_periodic_crawl)

    return {
        "status": "QUEUED",
        "message": "Serverless cron job queued for due sources.",
        "crawler_status": "Running" if crawler_manager.is_crawling else "Ready"
    }
