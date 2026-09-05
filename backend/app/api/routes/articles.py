import datetime
import hashlib
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from pydantic import BaseModel
import httpx
from bs4 import BeautifulSoup
from app.database.database import get_db
from app.database.models import (
    Article, ArticleUniversity, ArticleCategory,
    SentimentAnalysis, University, Category, Source
)
from app.database.schemas import (
    ArticleOut, ArticleDetail, ArticleCreate, SentimentConfirmationRequest
)
from app.services.crawler.validator import is_safe_url
from app.config import settings

router = APIRouter(prefix="/articles", tags=["Articles"])


def format_article_out(art: Article) -> dict:
    """Helper to structure Article ORM model into schema dictionary."""
    univ_links = []
    for ulink in art.universities:
        if ulink.university:
            univ_links.append({
                "university_id": ulink.university_id,
                "university_name": ulink.university.name,
                "short_name": ulink.university.short_name,
                "confidence_score": ulink.confidence_score
            })

    cat_links = []
    for clink in art.categories:
        if clink.category:
            cat_links.append({
                "category_id": clink.category_id,
                "category_name": clink.category.name,
                "confidence_score": clink.confidence_score
            })

    if art.sentiment:
        sentiment_data = {
            "sentiment": art.sentiment.sentiment,
            "positive_score": art.sentiment.positive_score,
            "neutral_score": art.sentiment.neutral_score,
            "negative_score": art.sentiment.negative_score,
            "confirmation_status": getattr(art.sentiment, "confirmation_status", "PENDING") or "PENDING",
            "confirmed_by": getattr(art.sentiment, "confirmed_by", None),
            "confirmed_at": getattr(art.sentiment, "confirmed_at", None)
        }
    else:
        sentiment_data = {
            "sentiment": "Neutral",
            "positive_score": 0.0,
            "neutral_score": 1.0,
            "negative_score": 0.0,
            "confirmation_status": "PENDING",
            "confirmed_by": None,
            "confirmed_at": None
        }

    return {
        "id": art.id,
        "source_id": art.source_id,
        "source_name": art.source.name if art.source else None,
        "title": art.title,
        "url": art.url,
        "author": art.author,
        "excerpt": art.excerpt,
        "summary": art.summary,
        "image_url": art.image_url,
        "published_at": art.published_at,
        "scraped_at": art.scraped_at,
        "language": art.language,
        "is_relevant": art.is_relevant,
        "relevance_score": art.relevance_score,
        "is_demo": art.is_demo,
        "universities": univ_links,
        "categories": cat_links,
        "sentiment": sentiment_data
    }


@router.get("", response_model=List[ArticleOut])
def list_articles(
    page: Optional[int] = Query(None, ge=1, description="Page number (1-based)"),
    limit: int = Query(50, ge=1, le=200, description="Items per page"),
    offset: Optional[int] = Query(None, ge=0, description="Items offset (alternative to page)"),
    search: Optional[str] = Query(None, description="Search term for title, content, or summary"),
    university: Optional[str] = Query(None, description="Filter by university name, short_name, or ID"),
    university_id: Optional[int] = Query(None, description="Filter by university ID"),
    category: Optional[str] = Query(None, description="Filter by category name"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment (Positive, Neutral, Negative)"),
    source: Optional[str] = Query(None, description="Filter by source name or ID"),
    source_id: Optional[int] = Query(None, description="Filter by source ID"),
    date_from: Optional[datetime.date] = Query(None, description="Filter articles published on or after (YYYY-MM-DD)"),
    date_to: Optional[datetime.date] = Query(None, description="Filter articles published on or before (YYYY-MM-DD)"),
    sort: Optional[str] = Query("newest", description="Sort order: newest, oldest, relevance"),
    is_relevant: Optional[bool] = Query(None, description="Filter by relevance"),
    min_relevance: Optional[float] = Query(None, description="Minimum relevance score (0-100)"),
    db: Session = Depends(get_db)
):
    """List and filter articles with multifaceted search options and pagination."""
    query = db.query(Article)

    # 1. Search Query
    if search:
        s_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Article.title.ilike(s_term),
                Article.content.ilike(s_term),
                Article.summary.ilike(s_term),
                Article.author.ilike(s_term)
            )
        )

    # 2. Filter University (by ID or short_name/name)
    target_univ_id = university_id
    if not target_univ_id and university:
        if university.isdigit():
            target_univ_id = int(university)
        else:
            u_match = db.query(University).filter(
                or_(
                    University.short_name.ilike(university),
                    University.name.ilike(f"%{university}%")
                )
            ).first()
            if u_match:
                target_univ_id = u_match.id

    if target_univ_id:
        query = query.join(Article.universities).filter(ArticleUniversity.university_id == target_univ_id)

    # 3. Filter Category
    if category:
        query = query.join(Article.categories).join(ArticleCategory.category).filter(Category.name.ilike(category))

    # 4. Filter Sentiment
    if sentiment:
        query = query.join(Article.sentiment).filter(SentimentAnalysis.sentiment.ilike(sentiment))

    # 5. Filter Source (by ID or name)
    target_source_id = source_id
    if not target_source_id and source:
        if source.isdigit():
            target_source_id = int(source)
        else:
            s_match = db.query(Source).filter(Source.name.ilike(f"%{source}%")).first()
            if s_match:
                target_source_id = s_match.id

    if target_source_id:
        query = query.filter(Article.source_id == target_source_id)

    # 6. Date Range Filters
    if date_from:
        start_dt = datetime.datetime.combine(date_from, datetime.time.min)
        query = query.filter(Article.published_at >= start_dt)
    if date_to:
        end_dt = datetime.datetime.combine(date_to, datetime.time.max)
        query = query.filter(Article.published_at <= end_dt)

    # 7. Relevance Filters
    if is_relevant is not None:
        query = query.filter(Article.is_relevant == is_relevant)

    if min_relevance is not None:
        query = query.filter(Article.relevance_score >= min_relevance)

    # 8. Sorting
    if sort == "oldest":
        query = query.order_by(Article.published_at.asc(), Article.id.asc())
    elif sort == "relevance":
        query = query.order_by(desc(Article.relevance_score), desc(Article.published_at))
    else:  # newest / default
        query = query.order_by(desc(Article.published_at), desc(Article.id))

    # 9. Pagination (support page or offset)
    calc_offset = offset if offset is not None else ((page - 1) * limit if page and page > 0 else 0)
    articles = query.offset(calc_offset).limit(limit).all()

    return [format_article_out(a) for a in articles]


@router.post("", response_model=ArticleDetail, status_code=201)
def create_article(data: ArticleCreate, db: Session = Depends(get_db)):
    """
    Create a new article with automated duplicate detection via content_hash and URL.
    Returns HTTP 409 if identical content_hash or URL already exists.
    """
    # 1. Check duplicate URL
    norm_url = data.url.strip()
    existing_url = db.query(Article).filter(Article.url == norm_url).first()
    if existing_url:
        raise HTTPException(
            status_code=409,
            detail=f"Duplicate article: URL already registered with ID {existing_url.id}"
        )

    # 2. Compute content hash (SHA-256 of cleaned content)
    raw_content = (data.content or "").strip()
    content_hash = hashlib.sha256(raw_content.encode("utf-8")).hexdigest()
    existing_hash = db.query(Article).filter(Article.content_hash == content_hash).first()
    if existing_hash:
        raise HTTPException(
            status_code=409,
            detail=f"Duplicate article: identical content hash detected from article ID {existing_hash.id}"
        )

    # 3. Create Article record
    pub_at = data.published_at or datetime.datetime.utcnow()
    article = Article(
        title=data.title.strip(),
        url=norm_url,
        content=raw_content,
        source_id=data.source_id,
        author=data.author,
        excerpt=data.excerpt or (raw_content[:200] + "..." if len(raw_content) > 200 else raw_content),
        summary=data.summary or data.excerpt,
        image_url=data.image_url,
        published_at=pub_at,
        scraped_at=datetime.datetime.utcnow(),
        content_hash=content_hash,
        language=data.language or "id",
        is_relevant=data.is_relevant or False,
        relevance_score=data.relevance_score or 0.0,
        is_demo=False
    )
    db.add(article)
    db.flush()

    # 4. Link Universities
    if data.university_ids:
        for uid in data.university_ids:
            db.add(ArticleUniversity(article_id=article.id, university_id=uid, confidence_score=1.0))

    # 5. Link Categories
    if data.category_ids:
        for cid in data.category_ids:
            db.add(ArticleCategory(article_id=article.id, category_id=cid, confidence_score=1.0))

    db.commit()
    db.refresh(article)

    base_data = format_article_out(article)
    base_data.update({
        "content": article.content,
        "content_hash": article.content_hash,
        "canonical_url": article.canonical_url
    })
    return base_data


@router.get("/{article_id}", response_model=ArticleDetail)
def get_article_detail(article_id: int, db: Session = Depends(get_db)):
    """Retrieve complete details of a single article including body and metadata."""
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    base_data = format_article_out(article)
    base_data.update({
        "content": article.content,
        "content_hash": article.content_hash,
        "canonical_url": article.canonical_url
    })
    return base_data


@router.post("/{article_id}/sentiment-confirmation", response_model=ArticleDetail)
def confirm_article_sentiment(
    article_id: int,
    req: SentimentConfirmationRequest,
    db: Session = Depends(get_db)
):
    """
    Persist human confirmation/rejection of AI sentiment analysis into SQLite database.
    States: CONFIRMED, REJECTED.
    Once set, confirmation status is persistent and survives page reloads.
    """
    article = db.query(Article).filter(Article.id == article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    status_val = req.status.upper().strip()
    if status_val not in ("CONFIRMED", "REJECTED"):
        raise HTTPException(status_code=400, detail="Status must be 'CONFIRMED' or 'REJECTED'")

    # Ensure SentimentAnalysis row exists
    if not article.sentiment:
        sent_record = SentimentAnalysis(
            article_id=article.id,
            sentiment=req.sentiment or "Neutral",
            positive_score=0.1,
            neutral_score=0.8,
            negative_score=0.1,
            confirmation_status=status_val,
            confirmed_by=req.confirmed_by or "Admin",
            confirmed_at=datetime.datetime.utcnow()
        )
        db.add(sent_record)
    else:
        article.sentiment.confirmation_status = status_val
        article.sentiment.confirmed_by = req.confirmed_by or "Admin"
        article.sentiment.confirmed_at = datetime.datetime.utcnow()
        if req.sentiment:
            article.sentiment.sentiment = req.sentiment

    db.commit()
    db.refresh(article)

    base_data = format_article_out(article)
    base_data.update({
        "content": article.content,
        "content_hash": article.content_hash,
        "canonical_url": article.canonical_url
    })
    return base_data


# ─────────────────────────────────────────────────────────────────────────────
# URL ANALYZER — paste any URL → AI fetches & analyzes the content
# ─────────────────────────────────────────────────────────────────────────────

class AnalyzeUrlRequest(BaseModel):
    url: str
    save_to_db: bool = False


@router.post("/analyze-url")
async def analyze_url(req: AnalyzeUrlRequest, db: Session = Depends(get_db)):
    """
    Fetch and analyze any article URL using the local AI pipeline.
    Returns: title, content, relevance, university, category, sentiment, summary.
    Optionally saves the article to SQLite if save_to_db=True.
    """
    safe, msg = is_safe_url(req.url)
    if not safe:
        raise HTTPException(status_code=400, detail=f"URL tidak aman: {msg}")

    # ── 1. Fetch article content ──────────────────────────────────────────────
    headers = {
        "User-Agent": settings.USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
    }
    try:
        async with httpx.AsyncClient(timeout=15.0, headers=headers, follow_redirects=True) as client:
            resp = await client.get(req.url)
            if resp.status_code != 200:
                raise HTTPException(status_code=422, detail=f"Gagal mengakses URL (HTTP {resp.status_code})")
            html = resp.text
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Timeout — URL tidak merespons dalam 15 detik")
    except httpx.RequestError as e:
        raise HTTPException(status_code=422, detail=f"Gagal mengakses URL: {str(e)}")

    # ── 2. Extract text ───────────────────────────────────────────────────────
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "nav", "header", "footer", "aside", "ads"]):
        tag.decompose()

    title = soup.title.get_text(strip=True) if soup.title else ""
    # Priority: OG title > h1 > <title>
    og_title = soup.find("meta", property="og:title")
    if og_title and og_title.get("content"):
        title = og_title["content"].strip()
    else:
        h1 = soup.find("h1")
        if h1:
            title = h1.get_text(strip=True)

    # If no title, fall back to URL path
    if not title:
        from urllib.parse import urlparse
        title = urlparse(req.url).path.split("/")[-1].replace("-", " ").replace("_", " ").title()

    # ── Get main content ─────────────────────────────────────────────────────
    # Try <article>, then divs with content-like classes, then all <p>
    article_tag = (
        soup.find("article")
        or soup.find("div", class_=lambda c: c and any(k in str(c).lower() for k in ["content", "article", "body", "post", "entry", "text"]))
    )
    if article_tag:
        paragraphs = article_tag.find_all("p")
    else:
        paragraphs = soup.find_all("p")

    content = " ".join(p.get_text(strip=True) for p in paragraphs if len(p.get_text(strip=True)) > 20)

    # If paragraphs are empty, use full body text (many ID news sites use <div> blocks)
    if len(content) < 100:
        body = soup.find("body")
        content = (body or soup).get_text(separator=" ", strip=True)[:5000]

    full_text = f"{title}. {content}"

    if len(full_text.strip()) < 30:
        raise HTTPException(status_code=422, detail="Konten terlalu pendek atau halaman tidak bisa dibaca")

    # ── 3. Run AI pipeline ─────────────────────────────────────────────────────
    try:
        from app.ai.pipeline import process_article_intelligence
        ai_result = process_article_intelligence(title=title, content=content[:4000])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI pipeline error: {str(e)}")

    # ── 4. Optionally save to DB ───────────────────────────────────────────────
    saved_id = None
    if req.save_to_db and ai_result.get("is_relevant"):
        content_hash = hashlib.md5(req.url.encode()).hexdigest()
        existing = db.query(Article).filter(Article.content_hash == content_hash).first()
        if not existing:
            new_art = Article(
                source_id=None,
                title=title[:500],
                url=req.url,
                canonical_url=req.url,
                content=content[:20000],
                content_hash=content_hash,
                language="id",
                is_relevant=ai_result.get("is_relevant", False),
                relevance_score=int(ai_result.get("relevance_score", 0)),
                summary=ai_result.get("summary", ""),
                is_demo=False,
                published_at=datetime.datetime.utcnow(),
                scraped_at=datetime.datetime.utcnow(),
            )
            db.add(new_art)
            db.flush()
            saved_id = new_art.id

            # Save sentiment
            sentiment_scores = ai_result.get("sentiment_scores", {})
            db.add(SentimentAnalysis(
                article_id=new_art.id,
                sentiment=ai_result.get("sentiment", "Neutral"),
                positive_score=sentiment_scores.get("positive", 0.33),
                neutral_score=sentiment_scores.get("neutral", 0.34),
                negative_score=sentiment_scores.get("negative", 0.33),
            ))
            db.commit()

    # ── 5. Return result ───────────────────────────────────────────────────────
    sentiment_scores = ai_result.get("sentiment_scores", {})
    detected_univs = ai_result.get("detected_universities", [])
    univ_names = [u.get("name", u) if isinstance(u, dict) else u for u in detected_univs]

    return {
        "url": req.url,
        "title": title,
        "excerpt": content[:300] + "..." if len(content) > 300 else content,
        "is_relevant": ai_result.get("is_relevant", False),
        "relevance_score": int(ai_result.get("relevance_score", 0)),
        "universities": univ_names,
        "categories": [ai_result.get("category", "")] if ai_result.get("category") else [],
        "sentiment": {
            "label": ai_result.get("sentiment", "Neutral"),
            "positive": round(sentiment_scores.get("positive", 0.33), 3),
            "neutral": round(sentiment_scores.get("neutral", 0.34), 3),
            "negative": round(sentiment_scores.get("negative", 0.33), 3),
        },
        "summary": ai_result.get("summary", ""),
        "word_count": len(full_text.split()),
        "saved_to_db": req.save_to_db and saved_id is not None,
        "article_id": saved_id,
    }
