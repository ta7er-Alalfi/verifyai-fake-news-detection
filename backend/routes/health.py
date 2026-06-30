from fastapi import APIRouter
from services.predict_service import PredictService

router = APIRouter(tags=["System & ML Model Info"])

@router.get("/health")
def health():
    info = PredictService.get_model_info()
    return {
        "status": "ok" if PredictService.is_loaded() else "loading",
        "model_loaded": PredictService.is_loaded(),
        "model_type": info["model_type"],
        "load_time_ms": info["load_time_ms"]
    }

@router.get("/model/info")
def model_info():
    info = PredictService.get_model_info()
    return {
        "model_type": info["model_type"],
        "base_model": info["base_model"],
        "max_length": info["max_length"],
        "labels": info["labels"],
        "roberta_available": info["roberta_available"]
    }
