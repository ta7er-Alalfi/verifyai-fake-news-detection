import os
from typing import List
from pydantic import BaseModel, Field

class Settings(BaseModel):
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-key-change-in-production-12345")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./verifyai.db")
    
    # External APIs
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        origin.strip() for origin in os.getenv("CORS_ORIGINS", "").split(",") if origin.strip()
    ] or [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]
    
    # Rate Limiting
    RATE_LIMIT_LOGIN_PER_MIN: int = 5
    RATE_LIMIT_REGISTER_PER_MIN: int = 3
    RATE_LIMIT_PREDICT_PER_MIN: int = 30
    RATE_LIMIT_CHAT_PER_MIN: int = 20

# Create settings singleton
settings = Settings()
