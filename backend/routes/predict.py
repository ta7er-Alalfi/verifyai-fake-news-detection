import time
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models.user import User
from models.prediction import PredictionHistory
from schemas.predict import PredictRequest, PredictResult, BatchRequest, BatchResult
from services.predict_service import PredictService
from middleware.auth_middleware import get_optional_user, get_current_user
from middleware.rate_limiter import predict_limiter
from middleware.security import sanitize_input

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.post("", response_model=PredictResult, dependencies=[Depends(predict_limiter)])
async def predict_single(
    req: PredictRequest,
    user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    if not PredictService.is_loaded():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Machine learning model is still loading..."
        )
        
    # Sanitize inputs
    sanitized_text = sanitize_input(req.text)
    sanitized_title = sanitize_input(req.title) if req.title else None
    
    # Run prediction
    clean_req = PredictRequest(text=sanitized_text, title=sanitized_title)
    result = PredictService.predict(clean_req)
    
    # Save to history if user is logged in
    if user:
        # Save first 2000 chars of text snippet to avoid huge database records
        text_snippet = sanitized_text[:2000]
        history_item = PredictionHistory(
            user_id=user.id,
            title=sanitized_title,
            text_snippet=text_snippet,
            label=result.label,
            confidence=result.confidence,
            prob_fake=result.prob_fake,
            prob_real=result.prob_real,
            model_used=result.model_used,
            latency_ms=result.latency_ms
        )
        db.add(history_item)
        await db.commit()
        
    return result

@router.post("/batch", response_model=BatchResult, dependencies=[Depends(predict_limiter)])
async def predict_batch(
    req: BatchRequest,
    user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db)
):
    if not PredictService.is_loaded():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Machine learning model is still loading..."
        )
        
    t0 = time.time()
    results = []
    
    for item in req.items:
        t_item = time.time()
        # Sanitize item
        sanitized_text = sanitize_input(item.text)
        sanitized_title = sanitize_input(item.title) if item.title else None
        
        clean_item = PredictRequest(text=sanitized_text, title=sanitized_title)
        res = PredictService.predict(clean_item)
        res.latency_ms = round((time.time() - t_item) * 1000, 2)
        results.append(res)
        
        # Save each to history if user is logged in
        if user:
            text_snippet = sanitized_text[:2000]
            history_item = PredictionHistory(
                user_id=user.id,
                title=sanitized_title,
                text_snippet=text_snippet,
                label=res.label,
                confidence=res.confidence,
                prob_fake=res.prob_fake,
                prob_real=res.prob_real,
                model_used=res.model_used,
                latency_ms=res.latency_ms
            )
            db.add(history_item)
            
    if user:
        await db.commit()
        
    total_latency = round((time.time() - t0) * 1000, 2)
    return BatchResult(results=results, total_latency_ms=total_latency)

@router.get("/history")
async def get_history(
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(PredictionHistory)
        .where(PredictionHistory.user_id == user.id)
        .order_by(PredictionHistory.created_at.desc())
        .limit(limit)
    )
    history = result.scalars().all()
    return history

