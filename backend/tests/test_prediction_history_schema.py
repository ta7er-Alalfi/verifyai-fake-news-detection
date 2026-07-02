from datetime import datetime

from schemas.predict import PredictionHistoryResponse


def test_prediction_history_response_accepts_datetime_created_at():
    item = PredictionHistoryResponse(
        id=1,
        title="Test title",
        text_snippet="Sample text",
        label="REAL",
        confidence=0.91,
        prob_fake=0.05,
        prob_real=0.95,
        model_used="roberta",
        latency_ms=24.5,
        created_at=datetime(2026, 7, 1, 14, 0, 0),
    )

    assert item.created_at == datetime(2026, 7, 1, 14, 0, 0)
