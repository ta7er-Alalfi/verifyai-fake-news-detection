from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=True)
    text_snippet = Column(String(2000), nullable=False) # Store first 2000 chars for reference
    label = Column(String(10), nullable=False) # "FAKE" or "REAL"
    confidence = Column(Float, nullable=False)
    prob_fake = Column(Float, nullable=False)
    prob_real = Column(Float, nullable=False)
    model_used = Column(String(50), nullable=False)
    latency_ms = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="predictions")
