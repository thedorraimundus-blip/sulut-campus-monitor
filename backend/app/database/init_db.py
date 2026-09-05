from app.database.database import engine, Base
from app.database.models import (
    User, Source, SourceFeed, University, UniversityAlias,
    Category, Article, ArticleUniversity, ArticleCategory, ArticleEntity,
    SentimentAnalysis, AIPrediction, CrawlLog, SystemLog, Setting,
    KeywordRule, TrainingData, ModelVersion, Alert
)
from app.utils.logger import logger


from sqlalchemy import text


def init_db():
    logger.info("Creating SQLite database tables for SULUT CAMPUS MONITOR...")
    Base.metadata.create_all(bind=engine)
    
    # Auto-migrate sentiment_analysis columns if upgrading existing database
    try:
        with engine.connect() as conn:
            cols = [r[1] for r in conn.execute(text("PRAGMA table_info(sentiment_analysis)")).fetchall()]
            if "confirmation_status" not in cols:
                conn.execute(text("ALTER TABLE sentiment_analysis ADD COLUMN confirmation_status VARCHAR(32) DEFAULT 'PENDING'"))
            if "confirmed_by" not in cols:
                conn.execute(text("ALTER TABLE sentiment_analysis ADD COLUMN confirmed_by VARCHAR(128)"))
            if "confirmed_at" not in cols:
                conn.execute(text("ALTER TABLE sentiment_analysis ADD COLUMN confirmed_at DATETIME"))
            conn.commit()
    except Exception as err:
        logger.warning(f"Note on sentiment_analysis schema upgrade: {err}")

    # Prepare SQLite FTS5 search index
    try:
        with engine.connect() as conn:
            conn.execute(text("""
                CREATE VIRTUAL TABLE IF NOT EXISTS articles_fts USING fts5(
                    title, content, summary, content=articles, content_rowid=id
                );
            """))
            conn.execute(text("""
                CREATE TRIGGER IF NOT EXISTS articles_ai AFTER INSERT ON articles BEGIN
                    INSERT INTO articles_fts(rowid, title, content, summary)
                    VALUES (new.id, new.title, new.content, new.summary);
                END;
            """))
            conn.execute(text("""
                CREATE TRIGGER IF NOT EXISTS articles_ad AFTER DELETE ON articles BEGIN
                    INSERT INTO articles_fts(articles_fts, rowid, title, content, summary)
                    VALUES ('delete', old.id, old.title, old.content, old.summary);
                END;
            """))
            conn.execute(text("""
                CREATE TRIGGER IF NOT EXISTS articles_au AFTER UPDATE ON articles BEGIN
                    INSERT INTO articles_fts(articles_fts, rowid, title, content, summary)
                    VALUES ('delete', old.id, old.title, old.content, old.summary);
                    INSERT INTO articles_fts(rowid, title, content, summary)
                    VALUES (new.id, new.title, new.content, new.summary);
                END;
            """))
            conn.commit()
    except Exception as e:
        logger.warning(f"Note on FTS5 initialization: {e}")

    logger.info("Database tables and FTS5 search preparation created successfully.")


if __name__ == "__main__":
    init_db()
