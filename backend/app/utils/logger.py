import logging
from datetime import datetime
from typing import Optional
from app.database.database import SessionLocal
from app.database.models import SystemLog

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s",
    handlers=[logging.StreamHandler()]
)

logger = logging.getLogger("SulutCampusMonitor")


def log_event(component: str, message: str, level: str = "INFO", details: Optional[str] = None):
    """Log an event to both python logger and the SQLite system_logs table."""
    log_func = getattr(logger, level.lower(), logger.info)
    log_func(f"[{component}] {message}")

    try:
        db = SessionLocal()
        sys_log = SystemLog(
            level=level.upper(),
            component=component,
            message=message[:512],
            details=details,
            created_at=datetime.utcnow()
        )
        db.add(sys_log)
        db.commit()
        db.close()
    except Exception as e:
        logger.error(f"Failed to record system log to database: {e}")
