import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=True)
    role = Column(String(32), default="admin", nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    @property
    def password_hash(self):
        return self.hashed_password

    @password_hash.setter
    def password_hash(self, value):
        self.hashed_password = value


class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    base_url = Column(String(512), nullable=False)
    rss_url = Column(String(512), nullable=True)
    source_type = Column(String(32), default="rss")  # rss, html, mixed
    is_active = Column(Boolean, default=True)
    crawl_interval = Column(Integer, default=5)  # minutes
    last_crawled = Column(DateTime, nullable=True)
    status = Column(String(32), default="IDLE")  # IDLE, CRAWLING, ACTIVE, ERROR
    error_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    articles = relationship("Article", back_populates="source", cascade="all, delete-orphan")
    feeds = relationship("SourceFeed", back_populates="source", cascade="all, delete-orphan")
    crawl_logs = relationship("CrawlLog", back_populates="source", cascade="all, delete-orphan")

    @property
    def url(self):
        return self.base_url

    @url.setter
    def url(self, value):
        self.base_url = value

    @property
    def monitoring_interval(self):
        return self.crawl_interval

    @monitoring_interval.setter
    def monitoring_interval(self, value):
        self.crawl_interval = value

    @property
    def last_checked(self):
        return self.last_crawled

    @last_checked.setter
    def last_checked(self, value):
        self.last_crawled = value


class SourceFeed(Base):
    __tablename__ = "source_feeds"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    feed_url = Column(String(512), nullable=False)
    feed_type = Column(String(32), default="rss")  # rss, atom
    last_fetched = Column(DateTime, nullable=True)
    status = Column(String(32), default="ACTIVE")

    source = relationship("Source", back_populates="feeds")


class University(Base):
    __tablename__ = "universities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(256), unique=True, nullable=False)
    short_name = Column(String(64), nullable=False)
    type = Column(String(16), default="PTS")  # PTN, PTS, PTK
    description = Column(Text, nullable=True)
    website = Column(String(256), nullable=True)
    logo = Column(String(512), nullable=True)
    city = Column(String(64), default="Manado")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    aliases = relationship("UniversityAlias", back_populates="university", cascade="all, delete-orphan")
    article_links = relationship("ArticleUniversity", back_populates="university", cascade="all, delete-orphan")

    @property
    def abbreviation(self):
        return self.short_name

    @abbreviation.setter
    def abbreviation(self, value):
        self.short_name = value


class UniversityAlias(Base):
    __tablename__ = "university_aliases"

    id = Column(Integer, primary_key=True, index=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False)
    alias = Column(String(128), index=True, nullable=False)

    university = relationship("University", back_populates="aliases")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(64), unique=True, nullable=False)
    description = Column(String(255), nullable=True)

    article_links = relationship("ArticleCategory", back_populates="category", cascade="all, delete-orphan")


class Article(Base):
    __tablename__ = "articles"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=True, index=True)
    title = Column(String(512), nullable=False, index=True)
    url = Column(String(1024), unique=True, nullable=False, index=True)
    canonical_url = Column(String(1024), nullable=True)
    author = Column(String(128), nullable=True)
    content = Column(Text, nullable=False)
    excerpt = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    image_url = Column(String(1024), nullable=True)
    published_at = Column(DateTime, nullable=True, index=True)
    scraped_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    content_hash = Column(String(64), index=True, nullable=False)
    language = Column(String(16), default="id")
    is_relevant = Column(Boolean, default=False, index=True)
    relevance_score = Column(Float, default=0.0)  # 0 - 100
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Composite indexes for high-frequency filtering and newsroom performance
    __table_args__ = (
        Index("idx_articles_source_published", "source_id", "published_at"),
        Index("idx_articles_relevance_published", "is_relevant", "published_at"),
    )

    source = relationship("Source", back_populates="articles")
    universities = relationship("ArticleUniversity", back_populates="article", cascade="all, delete-orphan")
    categories = relationship("ArticleCategory", back_populates="article", cascade="all, delete-orphan")
    entities = relationship("ArticleEntity", back_populates="article", cascade="all, delete-orphan")
    sentiment = relationship("SentimentAnalysis", back_populates="article", uselist=False, cascade="all, delete-orphan")
    ai_predictions = relationship("AIPrediction", back_populates="article", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="article", cascade="all, delete-orphan")

    @property
    def discovered_at(self):
        return self.scraped_at


class ArticleUniversity(Base):
    __tablename__ = "article_universities"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=False)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False)
    confidence_score = Column(Float, default=1.0)

    article = relationship("Article", back_populates="universities")
    university = relationship("University", back_populates="article_links")

    @property
    def confidence(self):
        return self.confidence_score

    @confidence.setter
    def confidence(self, value):
        self.confidence_score = value


class ArticleCategory(Base):
    __tablename__ = "article_categories"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    confidence_score = Column(Float, default=1.0)

    article = relationship("Article", back_populates="categories")
    category = relationship("Category", back_populates="article_links")

    @property
    def confidence(self):
        return self.confidence_score

    @confidence.setter
    def confidence(self, value):
        self.confidence_score = value


class ArticleEntity(Base):
    __tablename__ = "article_entities"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=False)
    entity_type = Column(String(64), nullable=False)  # PERSON, ORG, LOCATION, ROLE
    entity_name = Column(String(256), nullable=False)
    confidence_score = Column(Float, default=1.0)

    article = relationship("Article", back_populates="entities")


class SentimentAnalysis(Base):
    __tablename__ = "sentiment_analysis"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.id"), unique=True, nullable=False)
    sentiment = Column(String(32), nullable=False)  # Positive, Neutral, Negative
    positive_score = Column(Float, default=0.0)
    neutral_score = Column(Float, default=0.0)
    negative_score = Column(Float, default=0.0)
    confirmation_status = Column(String(32), default="PENDING")  # PENDING, CONFIRMED, REJECTED
    confirmed_by = Column(String(128), nullable=True)
    confirmed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    article = relationship("Article", back_populates="sentiment")

    @property
    def label(self):
        return self.sentiment

    @label.setter
    def label(self, value):
        self.sentiment = value

    @property
    def confidence(self):
        return self.positive_score

    @property
    def analyzed_at(self):
        return self.created_at


class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=False)
    model_version = Column(String(64), nullable=False)
    prediction_type = Column(String(64), nullable=False)  # relevance, category, sentiment, entity
    prediction = Column(String(256), nullable=False)
    confidence = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    article = relationship("Article", back_populates="ai_predictions")

    @property
    def model_name(self):
        return self.prediction_type


class CrawlLog(Base):
    __tablename__ = "crawl_logs"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=True)
    status = Column(String(32), nullable=False)  # SUCCESS, FAILED, PARTIAL
    articles_found = Column(Integer, default=0)
    articles_new = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    duration_ms = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    source = relationship("Source", back_populates="crawl_logs")

    @property
    def started_at(self):
        return self.created_at

    @property
    def finished_at(self):
        if self.created_at and self.duration_ms:
            return self.created_at + datetime.timedelta(milliseconds=self.duration_ms)
        return self.created_at


class SystemLog(Base):
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(String(16), default="INFO")  # INFO, WARNING, ERROR, CRITICAL
    component = Column(String(64), nullable=False)  # crawler, ai, api, scheduler, worker
    message = Column(String(512), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    @property
    def module(self):
        return self.component

    @module.setter
    def module(self, value):
        self.component = value


class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(64), unique=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class KeywordRule(Base):
    __tablename__ = "keyword_rules"

    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String(128), index=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=True)
    weight = Column(Float, default=1.0)
    rule_type = Column(String(32), default="relevance")  # relevance, category, entity, negative_alert
    is_active = Column(Boolean, default=True)


class TrainingData(Base):
    __tablename__ = "training_data"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    category = Column(String(64), nullable=False)
    sentiment = Column(String(32), nullable=True)
    is_relevant = Column(Boolean, default=True)
    verified_by_admin = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    @property
    def label(self):
        return self.category

    @property
    def source(self):
        return "manual_seed"


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    model_type = Column(String(64), nullable=False)  # category_classifier, sentiment_analyzer, relevance_scorer
    version = Column(String(64), unique=True, nullable=False)
    accuracy = Column(Float, default=0.0)
    precision = Column(Float, default=0.0)
    recall = Column(Float, default=0.0)
    f1_score = Column(Float, default=0.0)
    dataset_size = Column(Integer, default=0)
    is_active = Column(Boolean, default=False)
    filepath = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    @property
    def model_name(self):
        return self.model_type

    @property
    def training_samples(self):
        return self.dataset_size

    @property
    def status(self):
        return "ACTIVE" if self.is_active else "READY"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(256), nullable=False)
    message = Column(Text, nullable=False)
    article_id = Column(Integer, ForeignKey("articles.id"), nullable=True)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=True)
    alert_type = Column(String(64), default="NEGATIVE_SENTIMENT")  # NEGATIVE_SENTIMENT, CRISIS_KEYWORD, SPIKE
    severity = Column(String(32), default="WARNING")  # INFO, WARNING, CRITICAL
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    article = relationship("Article", back_populates="alerts")
