from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

class PredictRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=10_000)
    title: Optional[str] = Field(None, max_length=500)

    @field_validator("text")
    @classmethod
    def strip_text(cls, v: str) -> str:
        return v.strip()

class PredictResult(BaseModel):
    label: str           # "FAKE" or "REAL"
    confidence: float    # 0.0 – 1.0
    prob_fake: float
    prob_real: float
    model_used: str
    latency_ms: float
    explanation: Optional[str] = None

class BatchRequest(BaseModel):
    items: List[PredictRequest] = Field(..., min_length=1, max_length=10)

class BatchResult(BaseModel):
    results: List[PredictResult]
    total_latency_ms: float
