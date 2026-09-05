import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = DATA_DIR / "models"
TRAINING_DIR = DATA_DIR / "training"
CACHE_DIR = DATA_DIR / "cache"

DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)
TRAINING_DIR.mkdir(parents=True, exist_ok=True)
CACHE_DIR.mkdir(parents=True, exist_ok=True)


class Settings(BaseSettings):
    PROJECT_NAME: str = "SULUT CAMPUS MONITOR"
    PROJECT_TAGLINE: str = "Pantau Perkembangan Perguruan Tinggi Sulawesi Utara dalam Satu Dashboard."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Server host & port
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    FRONTEND_URL: str = "http://localhost:5173"

    # SQLite Database
    DATABASE_URL: str = f"sqlite:///{DATA_DIR / 'database.sqlite'}"
    
    # Security
    SECRET_KEY: str = "sulut-campus-monitor-secret-key-2026-secure-jwt-sulut-ai"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Crawler Settings
    # Using a real browser User-Agent is required for some Sulut news RSS feeds
    # (e.g., Tribun Manado uses Cloudflare which blocks bot UAs)
    USER_AGENT: str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    CRAWLER_TIMEOUT_SECONDS: int = 15
    CRAWLER_RATE_LIMIT_DELAY: float = 1.0  # seconds between requests to same domain
    DEFAULT_CRAWL_INTERVAL_MINUTES: int = 5
    
    # Local AI Settings
    BOOTSTRAP_MODEL_VERSION: str = "v1.0.0-bootstrap"
    MIN_RELEVANCE_SCORE_THRESHOLD: int = 40  # articles with relevance >= 40 considered relevant
    
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()
