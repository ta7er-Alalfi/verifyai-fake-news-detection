from routes.auth import router as auth_router
from routes.predict import router as predict_router
from routes.chatbot import router as chatbot_router
from routes.recommendations import router as recommendations_router
from routes.health import router as health_router

__all__ = ["auth_router", "predict_router", "chatbot_router", "recommendations_router", "health_router"]
