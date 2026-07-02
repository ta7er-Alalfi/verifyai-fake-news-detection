from datetime import datetime
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from database import get_db
from models.user import User
from models.prediction import PredictionHistory
from models.chat_message import ChatMessage
from schemas.chatbot import ChatRequest, ChatResponse, ChatHistoryItem
from services.chatbot_service import ChatbotService
from middleware.auth_middleware import get_current_user
from middleware.rate_limiter import chat_limiter
from middleware.security import sanitize_input

log = logging.getLogger("backend.chatbot")
router = APIRouter(prefix="/chat", tags=["AI Chatbot"])

@router.post("", response_model=ChatResponse, dependencies=[Depends(chat_limiter)])
async def chat_with_bot(
    req: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Sanitize message
    sanitized_msg = sanitize_input(req.message)
    log.info("Chat request received for user_id=%s: %s", user.id, sanitized_msg)
    
    # 1. Fetch recent predictions for context (last 5)
    pred_result = await db.execute(
        select(PredictionHistory)
        .where(PredictionHistory.user_id == user.id)
        .order_by(PredictionHistory.created_at.desc())
        .limit(5)
    )
    predictions = pred_result.scalars().all()
    pred_context = [
        {
            "title": p.title,
            "text_snippet": p.text_snippet,
            "label": p.label,
            "confidence": p.confidence
        }
        for p in predictions
    ]
    
    # 2. Fetch recent chat messages for conversational memory (last 10)
    chat_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(10)
    )
    chat_messages_desc = chat_result.scalars().all()
    
    # Reverse to chronological order (oldest to newest)
    chat_history = [
        {
            "role": m.role,
            "content": m.content
        }
        for m in reversed(chat_messages_desc)
    ]
    
    # 3. Call Chatbot Service to generate response
    response_text, context_used = await ChatbotService.generate_response(
        message=sanitized_msg,
        chat_history=chat_history,
        prediction_history=pred_context
    )
    
    # 4. Save dialogue turn in the database
    user_msg = ChatMessage(user_id=user.id, role="user", content=sanitized_msg)
    bot_msg = ChatMessage(user_id=user.id, role="model", content=response_text)
    
    db.add(user_msg)
    db.add(bot_msg)
    await db.commit()
    
    return ChatResponse(
        response=response_text,
        timestamp=datetime.utcnow(),
        context_used=context_used
    )

@router.get("/history", response_model=List[ChatHistoryItem])
async def get_chat_history(
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch chat history ordered by creation time
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user.id)
        .order_by(ChatMessage.created_at.asc())
        .limit(limit)
    )
    messages = result.scalars().all()
    
    return [
        ChatHistoryItem(
            role=m.role,
            content=m.content,
            timestamp=m.created_at
        )
        for m in messages
    ]

@router.delete("/history")
async def clear_chat_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await db.execute(
        delete(ChatMessage).where(ChatMessage.user_id == user.id)
    )
    await db.commit()
    return {"detail": "Chat history cleared successfully"}
