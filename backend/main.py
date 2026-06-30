from contextlib import asynccontextmanager
import logging
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from config import settings
from database import engine, Base
from logging_config import setup_logging
from middleware.security import SecurityHeadersMiddleware
from routes import (
    auth_router, predict_router, chatbot_router, 
    recommendations_router, health_router
)
from services.predict_service import PredictService
from services.chatbot_service import ChatbotService

log = logging.getLogger("fake-news-api")

STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Setup logging
    setup_logging()
    log.info("Starting VerifyAI Backend Server...")
    
    # 2. Database migrations (auto-create tables)
    try:
        log.info("Initializing database and tables...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        log.info("Database initialized successfully.")
    except Exception as e:
        log.error(f"Error during database initialization: {e}")
        
    # 3. Load machine learning models in the background/sync
    log.info("Loading machine learning models...")
    PredictService.load_models()
    
    # 4. Initialize chatbot service
    log.info("Initializing chatbot service...")
    ChatbotService.initialize()
    
    yield
    log.info("Shutting down VerifyAI Backend Server...")

# Initialize FastAPI app
app = FastAPI(
    title="VerifyAI API",
    description="Backend API with user auth, RoBERTa prediction, AI chatbot, and recommendations",
    version="2.0.0",
    lifespan=lifespan
)

# CORS configuration
# Restricted to trusted origins specified in settings config
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
)

# Custom Security Headers Middleware
app.add_middleware(SecurityHeadersMiddleware)

# Include API Routers
app.include_router(auth_router)
app.include_router(predict_router)
app.include_router(chatbot_router)
app.include_router(recommendations_router)
app.include_router(health_router)

# ── Serve React frontend (production only) ──────────────────
# In production (Docker), the built React app lives in ./static/
# Mount static assets (JS, CSS, images) and fall back to index.html for SPA routing
if os.path.isdir(STATIC_DIR) and os.path.isfile(os.path.join(STATIC_DIR, "index.html")):
    # Serve static assets (JS bundles, CSS, images, etc.)
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        """Catch-all: serve index.html for any non-API route (SPA client-side routing)."""
        # Try to serve the exact file first (e.g. favicon.ico, robots.txt)
        file_path = os.path.join(STATIC_DIR, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        # Otherwise fall back to index.html for client-side routing
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

