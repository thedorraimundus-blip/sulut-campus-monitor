from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import Setting
from app.api.deps import require_admin
from app.workers.scheduler import monitoring_scheduler

router = APIRouter(prefix="/settings", tags=["Settings"])


class SettingUpdate(BaseModel):
    key: str
    value: str


@router.get("")
def get_all_settings(db: Session = Depends(get_db)):
    """Retrieve all configurable system settings."""
    settings_records = db.query(Setting).all()
    return {s.key: {"value": s.value, "description": s.description} for s in settings_records}


@router.post("")
def update_setting(
    data: SettingUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """Update a system setting (e.g., crawl interval, demo mode)."""
    record = db.query(Setting).filter(Setting.key == data.key).first()
    if not record:
        record = Setting(key=data.key, value=data.value)
        db.add(record)
    else:
        record.value = data.value

    db.commit()

    # If updating crawl_interval, update the scheduler in runtime
    if data.key == "crawl_interval":
        try:
            interval = int(data.value)
            if interval in [1, 5, 10, 15, 30, 60]:
                monitoring_scheduler.schedule_crawl_job(interval)
        except ValueError:
            pass

    return {"message": f"Setting '{data.key}' updated to '{data.value}'"}
