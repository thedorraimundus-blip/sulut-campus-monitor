from fastapi import APIRouter, Query
from app.services.analytics.aggregator import get_analytics_summary

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("")
def get_analytics(days: int = Query(14, ge=3, le=90)):
    """Return aggregated higher education analytics for Recharts graphs."""
    return get_analytics_summary(days=days)
