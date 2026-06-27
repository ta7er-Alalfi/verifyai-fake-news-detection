from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models.user import User
from models.prediction import PredictionHistory
from schemas.recommendation import RecommendationsResponse
from services.recommendation_service import RecommendationService
from middleware.auth_middleware import get_current_user

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=RecommendationsResponse)
async def get_recommendations(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch recent predictions (up to 10) to feed the recommendation logic
    result = await db.execute(
        select(PredictionHistory)
        .where(PredictionHistory.user_id == user.id)
        .order_by(PredictionHistory.created_at.desc())
        .limit(10)
    )
    predictions = result.scalars().all()
    
    # Generate and return recommendations
    return RecommendationService.generate_recommendations(predictions)
