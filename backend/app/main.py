from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database.init_db import init_db
from app.workers.scheduler import monitoring_scheduler
from app.services.article_processor.processor import set_ws_broadcast_callback
from app.api.ws import ws_manager
from app.utils.logger import logger

from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

# Import API Routers
from app.api.routes.health import router as health_router
from app.api.routes.auth import router as auth_router
from app.api.routes.articles import router as articles_router
from app.api.routes.universities import router as universities_router
from app.api.routes.sources import router as sources_router
from app.api.routes.categories import router as categories_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.monitoring import router as monitoring_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.ai import router as ai_router
from app.api.routes.alerts import router as alerts_router
from app.api.routes.settings import router as settings_router
from app.api.routes.cron import router as cron_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup lifecycle
    logger.info("Initializing SULUT CAMPUS MONITOR Backend...")
    init_db()
    
    # Register WebSocket broadcast callback
    set_ws_broadcast_callback(ws_manager.broadcast)

    # Start background crawler scheduler
    try:
        monitoring_scheduler.start()
        logger.info("Background crawler scheduler started.")
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")

    yield

    # Shutdown lifecycle
    logger.info("Shutting down SULUT CAMPUS MONITOR...")
    monitoring_scheduler.shutdown()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Higher Education News Monitoring System for North Sulawesi (Sulawesi Utara).",
    version=settings.VERSION,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(articles_router, prefix=settings.API_V1_STR)
app.include_router(universities_router, prefix=settings.API_V1_STR)
app.include_router(sources_router, prefix=settings.API_V1_STR)
app.include_router(categories_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(monitoring_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)
app.include_router(alerts_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)
app.include_router(cron_router, prefix=settings.API_V1_STR)


# Global Exception Handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status_code": exc.status_code,
            "message": exc.detail
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "error": True,
            "status_code": 422,
            "message": "Validation error on request parameters",
            "details": exc.errors()
        }
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    logger.error(f"Unhandled system exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "status_code": 500,
            "message": "Internal server error occurred"
        }
    )


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Real-time live monitor WebSocket feed."""
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, listen for ping/client messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket connection error: {e}")
        ws_manager.disconnect(websocket)


@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE,
        "version": settings.VERSION,
        "status": "ONLINE",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }
