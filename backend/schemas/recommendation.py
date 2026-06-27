from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class RecommendationCard(BaseModel):
    type: str          # "trend", "tip", "insight", "educational"
    title: str
    description: str
    icon: str          # Name of Lucide icon to render on frontend
    color: str         # Tailwind/CSS color class or hex (e.g. "blue", "green")
    action_url: Optional[str] = None

class RecommendationsResponse(BaseModel):
    cards: List[RecommendationCard]
    generated_at: datetime = Field(default_factory=datetime.utcnow)
