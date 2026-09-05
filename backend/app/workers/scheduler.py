import datetime
from typing import Optional, Dict, Any, List
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.config import settings
from app.database.database import SessionLocal
from app.database.models import Source
from app.services.crawler.manager import crawler_manager
from app.utils.logger import logger, log_event

JOB_ID = "periodic_crawler_job"


class MonitoringScheduler:
    """
    Periodic Monitoring Scheduler:
    - Runs periodically across all active media sources.
    - Inspects source.crawl_interval (1, 5, 10, 15, 30, 60 minutes).
    - Ensures non-blocking execution and isolates failures per source.
    - Tracks last_run_time and next_run_time.
    """

    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.is_running = False
        self.current_interval_minutes = settings.DEFAULT_CRAWL_INTERVAL_MINUTES
        self.last_run_time: Optional[datetime.datetime] = None

    def start(self):
        """Start the background scheduler."""
        if not self.scheduler.running:
            self.scheduler.start()
            self.is_running = True
            self.schedule_crawl_job(self.current_interval_minutes)
            log_event("scheduler", f"Scheduler started. Periodic crawl cycle every {self.current_interval_minutes}m.", "INFO")

    def schedule_crawl_job(self, interval_minutes: int):
        """Schedule or reschedule the periodic crawling job."""
        self.current_interval_minutes = interval_minutes
        trigger = IntervalTrigger(minutes=interval_minutes)

        if self.scheduler.get_job(JOB_ID):
            self.scheduler.reschedule_job(JOB_ID, trigger=trigger)
        else:
            self.scheduler.add_job(
                self._run_periodic_crawl,
                trigger=trigger,
                id=JOB_ID,
                name="Periodic Sulut Campus Crawler",
                replace_existing=True,
                max_instances=1
            )
        logger.info(f"Crawl job scheduled every {interval_minutes} minutes.")

    async def _run_periodic_crawl(self):
        """
        Job executor invoked by APScheduler:
        1. Queries active media sources.
        2. Filters sources whose last_crawled + crawl_interval <= now.
        3. Crawls sources and triggers local AI analysis automatically.
        """
        self.last_run_time = datetime.datetime.utcnow()
        db = SessionLocal()
        due_sources: List[int] = []
        try:
            now = datetime.datetime.utcnow()
            active_sources = db.query(Source).filter(Source.is_active == True).all()
            for s in active_sources:
                interval_min = s.crawl_interval or 5
                if not s.last_crawled:
                    due_sources.append(s.id)
                else:
                    diff_minutes = (now - s.last_crawled).total_seconds() / 60.0
                    if diff_minutes >= (interval_min - 0.5):
                        due_sources.append(s.id)
        except Exception as e:
            logger.error(f"[Scheduler] Error inspecting active sources: {e}")
            log_event("scheduler", f"Error checking sources: {e}", "ERROR")
        finally:
            db.close()

        if due_sources:
            logger.info(f"[Scheduler] Running periodic crawl on {len(due_sources)} due sources.")
            for sid in due_sources:
                try:
                    await crawler_manager.crawl_source(sid)
                except Exception as src_err:
                    logger.error(f"[Scheduler] Crawl error on source {sid}: {src_err}")
                    log_event("scheduler", f"Source {sid} crawl failed: {src_err}", "WARNING")
        else:
            logger.info("[Scheduler] No sources due for crawling this cycle.")

    def shutdown(self):
        """Shutdown scheduler cleanly."""
        if self.scheduler.running:
            self.scheduler.shutdown(wait=False)
            self.is_running = False
            logger.info("Scheduler shutdown.")

    def get_status(self) -> Dict[str, Any]:
        """Return live scheduler health metrics."""
        job = self.scheduler.get_job(JOB_ID)
        next_run = str(job.next_run_time) if job and job.next_run_time else None
        return {
            "is_running": self.scheduler.running,
            "interval_minutes": self.current_interval_minutes,
            "last_run": str(self.last_run_time) if self.last_run_time else None,
            "next_run": next_run
        }


monitoring_scheduler = MonitoringScheduler()
