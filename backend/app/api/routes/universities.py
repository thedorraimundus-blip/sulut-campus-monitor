from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.database.models import University, UniversityAlias, ArticleUniversity, SentimentAnalysis
from app.database.schemas import UniversityOut, UniversityCreate, UniversityUpdate
from app.api.deps import require_admin
from app.ai.entity_detector import entity_detector

router = APIRouter(prefix="/universities", tags=["Universities"])


def format_university(u: University, db: Session) -> dict:
    """Compute live coverage counts for a university."""
    # Count related articles
    art_ids = [
        link.article_id for link in
        db.query(ArticleUniversity.article_id).filter(ArticleUniversity.university_id == u.id).all()
    ]
    art_count = len(art_ids)

    pos_count = 0
    neu_count = 0
    neg_count = 0

    if art_ids:
        pos_count = db.query(SentimentAnalysis).filter(
            SentimentAnalysis.article_id.in_(art_ids),
            SentimentAnalysis.sentiment == "Positive"
        ).count()
        neu_count = db.query(SentimentAnalysis).filter(
            SentimentAnalysis.article_id.in_(art_ids),
            SentimentAnalysis.sentiment == "Neutral"
        ).count()
        neg_count = db.query(SentimentAnalysis).filter(
            SentimentAnalysis.article_id.in_(art_ids),
            SentimentAnalysis.sentiment == "Negative"
        ).count()

    aliases_out = [{"id": a.id, "alias": a.alias} for a in u.aliases]

    return {
        "id": u.id,
        "name": u.name,
        "short_name": u.short_name,
        "description": u.description,
        "website": u.website,
        "logo": u.logo,
        "city": u.city,
        "is_active": u.is_active,
        "created_at": u.created_at,
        "aliases": aliases_out,
        "article_count": art_count,
        "positive_count": pos_count,
        "neutral_count": neu_count,
        "negative_count": neg_count
    }


@router.get("", response_model=List[UniversityOut])
def list_universities(db: Session = Depends(get_db)):
    """List all monitored universities in North Sulawesi with coverage statistics."""
    univs = db.query(University).filter(University.is_active == True).all()
    # Sort by article count descending
    result = [format_university(u, db) for u in univs]
    result.sort(key=lambda x: x["article_count"], reverse=True)
    return result


@router.get("/{univ_id}", response_model=UniversityOut)
def get_university(univ_id: int, db: Session = Depends(get_db)):
    """Retrieve detailed profile and metrics for a specific university."""
    univ = db.query(University).filter(University.id == univ_id).first()
    if not univ:
        raise HTTPException(status_code=404, detail="University not found")
    return format_university(univ, db)


@router.post("", response_model=UniversityOut, status_code=201)
def create_university(
    data: UniversityCreate,
    db: Session = Depends(get_db)
):
    """Add a new university to monitor."""
    existing = db.query(University).filter(University.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="University with this name already exists")

    univ = University(
        name=data.name,
        short_name=data.short_name,
        description=data.description,
        website=data.website,
        logo=data.logo,
        city=data.city,
        is_active=data.is_active
    )
    db.add(univ)
    db.flush()

    for alias in data.aliases:
        if alias.strip():
            db.add(UniversityAlias(university_id=univ.id, alias=alias.strip()))

    db.commit()
    entity_detector._refresh_cache()
    return format_university(univ, db)


@router.put("/{univ_id}", response_model=UniversityOut)
def update_university(
    univ_id: int,
    data: UniversityUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """Update university details or aliases."""
    univ = db.query(University).filter(University.id == univ_id).first()
    if not univ:
        raise HTTPException(status_code=404, detail="University not found")

    if data.name is not None:
        univ.name = data.name
    if data.short_name is not None:
        univ.short_name = data.short_name
    if data.description is not None:
        univ.description = data.description
    if data.website is not None:
        univ.website = data.website
    if data.logo is not None:
        univ.logo = data.logo
    if data.city is not None:
        univ.city = data.city
    if data.is_active is not None:
        univ.is_active = data.is_active

    if data.aliases is not None:
        db.query(UniversityAlias).filter(UniversityAlias.university_id == univ.id).delete()
        for alias in data.aliases:
            if alias.strip():
                db.add(UniversityAlias(university_id=univ.id, alias=alias.strip()))

    db.commit()
    entity_detector._refresh_cache()
    return format_university(univ, db)


@router.delete("/{univ_id}")
def delete_university(
    univ_id: int,
    db: Session = Depends(get_db),
    admin=Depends(require_admin)
):
    """Delete a university from monitoring."""
    univ = db.query(University).filter(University.id == univ_id).first()
    if not univ:
        raise HTTPException(status_code=404, detail="University not found")
    db.delete(univ)
    db.commit()
    entity_detector._refresh_cache()
    return {"message": "University deleted"}
