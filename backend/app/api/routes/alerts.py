from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.database import get_db
from app.database.models import Alert
from app.database.schemas import AlertOut
from app.api.deps import require_admin

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=List[AlertOut])
def list_alerts(
    unread_only: bool = Query(False, description="Filter to only unread alerts"),
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List system generated alerts with full source media and article traceability."""
    q = db.query(Alert)
    if unread_only:
        q = q.filter(Alert.is_read == False)
    alerts = q.order_by(desc(Alert.created_at)).limit(limit).all()
    
    enriched = []
    for a in alerts:
        source_name = None
        article_title = None
        article_url = None
        if a.article:
            article_title = a.article.title
            article_url = a.article.url
            if a.article.source:
                source_name = a.article.source.name

        enriched.append({
            "id": a.id,
            "title": a.title,
            "message": a.message,
            "article_id": a.article_id,
            "university_id": a.university_id,
            "alert_type": a.alert_type,
            "severity": a.severity,
            "is_read": a.is_read,
            "created_at": a.created_at,
            "source_name": source_name,
            "article_title": article_title,
            "article_url": article_url
        })
    return enriched


@router.post("/mark-all-read")
def mark_all_alerts_as_read(
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """Mark ALL unread alerts as read (bulk action)."""
    db.query(Alert).filter(Alert.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "All alerts marked as read"}


@router.post("/{alert_id}/read")
def mark_alert_as_read(
    alert_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """Mark an alert as read by administrator."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    db.commit()
    return {"message": "Alert marked as read"}
