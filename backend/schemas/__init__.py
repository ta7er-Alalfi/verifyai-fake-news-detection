from schemas.auth import UserResponse, RegisterRequest, LoginRequest, TokenResponse, GoogleAuthRequest, ProfileUpdateRequest
from schemas.predict import PredictRequest, PredictResult, BatchRequest, BatchResult
from schemas.chatbot import ChatRequest, ChatResponse, ChatHistoryItem
from schemas.recommendation import RecommendationCard, RecommendationsResponse

__all__ = [
    "UserResponse", "RegisterRequest", "LoginRequest", "TokenResponse", "GoogleAuthRequest", "ProfileUpdateRequest",
    "PredictRequest", "PredictResult", "BatchRequest", "BatchResult",
    "ChatRequest", "ChatResponse", "ChatHistoryItem",
    "RecommendationCard", "RecommendationsResponse"
]
