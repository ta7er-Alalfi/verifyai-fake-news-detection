from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(10), nullable=False) # "user" or "model"
    content = Column(String(2000), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship back to User
    user = relationship("User", back_populates="chat_messages")
