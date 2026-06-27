from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

# Include Routers
app.include_router(auth_router)
app.include_router(predict_router)
app.include_router(chatbot_router)
app.include_router(recommendations_router)
app.include_router(health_router)
