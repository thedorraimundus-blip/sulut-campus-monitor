from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    role: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- University Schemas ---
class UniversityAliasOut(BaseModel):
    id: int
    alias: str

    model_config = ConfigDict(from_attributes=True)


class UniversityBase(BaseModel):
    name: str
    short_name: str
    type: Optional[str] = "PTS"
    description: Optional[str] = None
    website: Optional[str] = None
    logo: Optional[str] = None
    city: Optional[str] = "Manado"
    is_active: bool = True


class UniversityCreate(UniversityBase):
    aliases: List[str] = []


class UniversityUpdate(BaseModel):
    name: Optional[str] = None
    short_name: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    logo: Optional[str] = None
    city: Optional[str] = None
    is_active: Optional[bool] = None
    aliases: Optional[List[str]] = None


class UniversityOut(UniversityBase):
    id: int
    created_at: datetime
    aliases: List[UniversityAliasOut] = []
    article_count: Optional[int] = 0
    positive_count: Optional[int] = 0
    neutral_count: Optional[int] = 0
    negative_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


# --- Source Schemas ---
class SourceBase(BaseModel):
    name: str
    base_url: str
    rss_url: Optional[str] = None
    source_type: str = "rss"
    is_active: bool = True
    crawl_interval: int = 5


class SourceCreate(BaseModel):
    name: str
    base_url: Optional[str] = None
    url: Optional[str] = None
    rss_url: Optional[str] = None
    source_type: Optional[str] = "rss"
    is_active: Optional[bool] = True
    crawl_interval: Optional[int] = 5
    monitoring_interval: Optional[int] = None


class SourceUpdate(BaseModel):
    name: Optional[str] = None
    base_url: Optional[str] = None
    url: Optional[str] = None
    rss_url: Optional[str] = None
    source_type: Optional[str] = None
    is_active: Optional[bool] = None
    crawl_interval: Optional[int] = None
    monitoring_interval: Optional[int] = None


class SourceOut(SourceBase):
    id: int
    last_crawled: Optional[datetime] = None
    status: str
    error_count: int
    created_at: datetime
    article_count: Optional[int] = 0
    relevant_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


class SourceTestRequest(BaseModel):
    url: str
    rss_url: Optional[str] = None


class SourceTestResult(BaseModel):
    valid_url: bool
    robots_allowed: bool
    rss_detected: bool
    rss_url: Optional[str] = None
    sample_articles_found: int = 0
    message: str


# --- Category Schemas ---
class CategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# --- Sentiment Schemas ---
class SentimentOut(BaseModel):
    sentiment: str
    positive_score: float
    neutral_score: float
    negative_score: float
    confirmation_status: Optional[str] = "PENDING"
    confirmed_by: Optional[str] = None
    confirmed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SentimentConfirmationRequest(BaseModel):
    status: str  # "CONFIRMED" or "REJECTED"
    sentiment: Optional[str] = None  # optionally override sentiment (e.g. "Negative", "Positive", "Neutral")
    confirmed_by: Optional[str] = "Admin"


# --- Article Schemas ---
class ArticleUniversityLink(BaseModel):
    university_id: int
    university_name: str
    short_name: str
    confidence_score: float


class ArticleCategoryLink(BaseModel):
    category_id: int
    category_name: str
    confidence_score: float


class ArticleCreate(BaseModel):
    title: str
    url: str
    content: str
    source_id: Optional[int] = None
    author: Optional[str] = None
    excerpt: Optional[str] = None
    summary: Optional[str] = None
    image_url: Optional[str] = None
    published_at: Optional[datetime] = None
    is_relevant: Optional[bool] = False
    relevance_score: Optional[float] = 0.0
    language: Optional[str] = "id"
    university_ids: Optional[List[int]] = []
    category_ids: Optional[List[int]] = []


class ArticleOut(BaseModel):
    id: int
    source_id: Optional[int] = None
    source_name: Optional[str] = None
    title: str
    url: str
    author: Optional[str] = None
    excerpt: Optional[str] = None
    summary: Optional[str] = None
    image_url: Optional[str] = None
    published_at: Optional[datetime] = None
    scraped_at: datetime
    language: str
    is_relevant: bool
    relevance_score: float
    is_demo: bool
    universities: List[ArticleUniversityLink] = []
    categories: List[ArticleCategoryLink] = []
    sentiment: Optional[SentimentOut] = None

    model_config = ConfigDict(from_attributes=True)


class ArticleDetail(ArticleOut):
    content: str
    content_hash: str
    canonical_url: Optional[str] = None


class PaginatedArticles(BaseModel):
    total: int
    page: int
    limit: int
    pages: int
    items: List[ArticleOut]


# --- Dashboard KPI Schemas ---
class DashboardStats(BaseModel):
    total_articles: int
    articles_today: int
    total_universities: int
    active_sources: int
    today_articles: Optional[int] = None
    relevant_articles: Optional[int] = 0
    monitored_universities: Optional[int] = 0
    positive_count: Optional[int] = 0
    neutral_count: Optional[int] = 0
    negative_count: Optional[int] = 0
    crawler_status: Optional[str] = "Ready"
    ai_engine_status: Optional[str] = "Ready"
    last_crawl_time: Optional[datetime] = None


class TrendItem(BaseModel):
    date: str
    total: int
    relevant: int


class DashboardTrends(BaseModel):
    days: int
    volume_trend: List[TrendItem]


class SentimentDistributionItem(BaseModel):
    name: str
    value: int
    color: str


class DashboardSentiment(BaseModel):
    total: int
    positive: int
    neutral: int
    negative: int
    distribution: List[SentimentDistributionItem]


# --- AI Intelligence Schemas ---
class AIStatusOut(BaseModel):
    model_version: str
    is_bootstrap: bool
    accuracy: float
    f1_score: float
    dataset_size: int
    last_trained: Optional[datetime] = None
    classes_count: int
    status_label: str  # "Ready", "Needs Training", "Training"


class TrainingDataCreate(BaseModel):
    text: str
    category: str
    sentiment: Optional[str] = "Neutral"
    is_relevant: bool = True


class TrainingDataOut(BaseModel):
    id: int
    text: str
    category: str
    sentiment: Optional[str] = None
    is_relevant: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TrainModelResponse(BaseModel):
    success: bool
    new_version: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    dataset_size: int
    message: str


# --- Alert Schemas ---
class AlertOut(BaseModel):
    id: int
    title: str
    message: str
    article_id: Optional[int] = None
    university_id: Optional[int] = None
    alert_type: str
    severity: str
    is_read: bool
    created_at: datetime
    source_name: Optional[str] = None
    article_title: Optional[str] = None
    article_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# --- Log Schemas ---
class SystemLogOut(BaseModel):
    id: int
    level: str
    component: str
    message: str
    details: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CrawlLogOut(BaseModel):
    id: int
    source_id: Optional[int] = None
    source_name: Optional[str] = None
    status: str
    articles_found: int
    articles_new: int
    error_message: Optional[str] = None
    duration_ms: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
