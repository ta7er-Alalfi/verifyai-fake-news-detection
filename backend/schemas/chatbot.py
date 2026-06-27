from datetime import datetime
from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)

class ChatResponse(BaseModel):
    response: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    context_used: bool = False

class ChatHistoryItem(BaseModel):
    role: str # "user" or "model"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
