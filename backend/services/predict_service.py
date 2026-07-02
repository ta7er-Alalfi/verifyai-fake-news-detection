import gc
import logging
import os
import re
import time
from schemas.predict import PredictRequest, PredictResult

# Optional imports for ML models
try:
    import torch
    from transformers import pipeline as hf_pipeline
    _HAS_TORCH = True
except ImportError:
    _HAS_TORCH = False
    torch = None
    hf_pipeline = None

log = logging.getLogger("predict-service")

MODEL_DIR = os.environ.get("MODEL_DIR", "./saved_model")
HF_MODEL_NAME = os.environ.get("HF_MODEL_NAME", "ta7era7med/verifyai-roberta")

class PredictService:
    _roberta_pipe = None
    _model_loaded = False
    _model_type = "none"
    _load_time_ms = 0

    _anonymous_patterns = [
        "anonymous sources",
        "anonymous source",
        "people say",
        "experts claim",
        "according to insiders",
        "someone said",
        "allegedly",
    ]

    _urgency_patterns = [
        "share now",
        "before deleted",
        "urgent",
        "must share",
        "act now",
        "do not wait",
        "forward this",
    ]

    _miracle_patterns = [
        "cures all diseases",
        "miracle treatment",
        "miracle cure",
        "cures cancer",
        "heals everything",
        "instant cure",
        "medical miracle",
    ]

    _conspiracy_patterns = [
        "government hides",
        "secret truth",
        "cover up",
        "they don't want you to know",
        "they are hiding",
        "deep state",
        "hidden agenda",
    ]

    _official_patterns = [
        "according to nasa",
        "according to the cdc",
        "according to the who",
        "official report",
        "official statement",
        "official updates",
        "government agency",
        "world health organization",
        "united nations",
        "federal agency",
        "public health",
        "public data",
        "agency",
        "nasa",
    ]

    _evidence_patterns = [
        "according to",
        "reported by",
        "study says",
        "research shows",
        "data shows",
        "evidence shows",
        "verified",
        "confirmed",
    ]

    _balanced_patterns = [
        "however",
        "while",
        "although",
        "balanced",
        "measured",
        "context",
        "analysis",
        "review",
    ]

    _clickbait_patterns = [
        "breaking",
        "shocking",
        "you won't believe",
        "must see",
        "clickbait",
        "mind blowing",
        "you need to see",
    ]

    @classmethod
    def load_models(cls):
        """Loads RoBERTa model: local saved_model first, then Hugging Face fallback, then demo mode."""
        t0 = time.time()

        if _HAS_TORCH:
            # Determine model source: local directory or Hugging Face hub
            local_has_weights = (
                os.path.isdir(MODEL_DIR)
                and os.path.exists(os.path.join(MODEL_DIR, "model.safetensors"))
                and os.path.exists(os.path.join(MODEL_DIR, "config.json"))
            )
            model_path = MODEL_DIR if local_has_weights else HF_MODEL_NAME

            try:
                log.info(f"Loading RoBERTa from: {model_path} (local={local_has_weights})")
                device = 0 if torch.cuda.is_available() else -1
                cls._roberta_pipe = hf_pipeline(
                    "text-classification",
                    model=model_path,
                    tokenizer=model_path,
                    device=device,
                    truncation=True,
                    max_length=384,
                    padding=True,
                )
                cls._model_type = "roberta"
                cls._model_loaded = True
                log.info(f"[SUCCESS] RoBERTa loaded (device={'cuda' if device == 0 else 'cpu'}, source={'local' if local_has_weights else 'huggingface'})")
            except Exception as e:
                log.warning(f"[WARNING] RoBERTa load failed: {e}")

        if not cls._model_loaded:
            log.warning("[WARNING] No models available — running in demo mode (deterministic predictions)")
            cls._model_type = "demo"
            cls._model_loaded = True

        cls._load_time_ms = round((time.time() - t0) * 1000)
        gc.collect()

    @classmethod
    def is_loaded(cls) -> bool:
        return cls._model_loaded

    @classmethod
    def get_model_info(cls) -> dict:
        return {
            "model_type": cls._model_type,
            "base_model": "roberta-base" if cls._model_type == "roberta" else "demo_mode",
            "hf_model": HF_MODEL_NAME,
            "max_length": 384,
            "labels": ["FAKE", "REAL"],
            "roberta_available": cls._roberta_pipe is not None,
            "load_time_ms": cls._load_time_ms
        }

    @classmethod
    def _build_input(cls, req: PredictRequest) -> str:
        """Concatenate title + text (same schema as training)."""
        if req.title and req.title.strip():
            return f"{req.title.strip()} {req.text.strip()}"
        return req.text.strip()

    @classmethod
    def _detect_indicators(cls, text: str) -> tuple[list[str], list[str]]:
        text_lower = text.lower()
        suspicious_indicators: list[str] = []
        positive_indicators: list[str] = []

        if any(pattern in text_lower for pattern in cls._anonymous_patterns):
            suspicious_indicators.append("Anonymous or unverified sourcing")

        if any(pattern in text_lower for pattern in cls._urgency_patterns):
            suspicious_indicators.append("Urgency and manipulation")

        if any(pattern in text_lower for pattern in cls._miracle_patterns):
            suspicious_indicators.append("Miracle cure or medical misinformation")

        if any(pattern in text_lower for pattern in cls._conspiracy_patterns):
            suspicious_indicators.append("Conspiracy framing")

        if any(pattern in text_lower for pattern in cls._official_patterns):
            positive_indicators.append("References to official organizations")

        if any(pattern in text_lower for pattern in cls._evidence_patterns):
            positive_indicators.append("Evidence-based wording")

        if any(pattern in text_lower for pattern in cls._balanced_patterns):
            positive_indicators.append("Balanced and measured language")

        if not any(pattern in text_lower for pattern in cls._clickbait_patterns):
            positive_indicators.append("No clickbait or sensational language detected")

        if not suspicious_indicators:
            positive_indicators.append("Neutral language")
            positive_indicators.append("Objective reporting")

        if not suspicious_indicators and not positive_indicators:
            positive_indicators.append("Neutral language")
            positive_indicators.append("Objective reporting")

        return suspicious_indicators, positive_indicators

    @classmethod
    def _build_explanation(cls, prediction: str, text: str, suspicious_indicators: list[str], positive_indicators: list[str]) -> tuple[str, list[str], list[str]]:
        if prediction == "FAKE":
            if suspicious_indicators:
                indicator_text = ", ".join(suspicious_indicators)
                explanation = (
                    f"This article was classified as FAKE because the text contains several misinformation-style cues, including {indicator_text}. "
                    "The wording suggests unverified claims, pressure to share quickly, or sensational framing."
                )
            else:
                explanation = "No major misinformation indicators were detected."
            return explanation, suspicious_indicators, []

        if positive_indicators:
            indicator_text = ", ".join(positive_indicators)
            explanation = (
                f"This article was classified as REAL because the wording appears measured and evidence-based. Positive signals include {indicator_text}."
            )
        else:
            explanation = "This article was classified as REAL. The tone appears measured and the content does not display major misinformation cues."
        return explanation, [], positive_indicators

    @classmethod
    def _predict_one(cls, text: str) -> dict:
        # 1. Base ML model prediction
        raw_prob_fake = 0.5
        raw_prob_real = 0.5
        model_used = "demo_mode"

        if cls._model_type == "roberta" and cls._roberta_pipe is not None:
            try:
                tokenizer = cls._roberta_pipe.tokenizer
                model = cls._roberta_pipe.model

                # 1. Tokenizer input
                inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=384).to(model.device)
                
                with torch.no_grad():
                    outputs = model(**inputs)
                
                # 2. Model logits
                logits = outputs.logits
                
                # 3. Softmax probabilities
                probs = torch.nn.functional.softmax(logits, dim=-1)
                
                # 4. Predicted class index
                predicted_class = torch.argmax(probs, dim=-1).item()
                
                # 5. Final returned label
                label = model.config.id2label[predicted_class]
                log.info(f"Label={label}")
                log.info(f"Fake={raw_prob_fake}")
                log.info(f"Real={raw_prob_real}")  
                
                print("--- PIPELINE AUDIT ---")
                print("1. Tokenizer input:", inputs["input_ids"])
                print("2. Model logits:", logits)
                print("3. Softmax probabilities:", probs)
                print("4. Predicted class index:", predicted_class)
                print("5. Final returned label:", label)
                print("----------------------")
                
                # Ensure mapping correctly regardless of which is 0 or 1
                fake_idx = None
                real_idx = None
                for k, v in model.config.id2label.items():
                    if str(v).upper() == "FAKE":
                        fake_idx = int(k)
                    elif str(v).upper() == "REAL":
                        real_idx = int(k)
                
                if fake_idx is not None and real_idx is not None:
                    raw_prob_fake = probs[0][fake_idx].item()
                    raw_prob_real = probs[0][real_idx].item()
                else:
                    # Fallback if labels are not standard
                    score = probs[0][predicted_class].item()
                    raw_prob_real = score if str(label).upper() == "REAL" else 1 - score
                    raw_prob_fake = 1 - raw_prob_real

                model_used = "roberta-base"
            except Exception as e:
                log.error(f"RoBERTa prediction error: {e}")

        if cls._model_type == "demo":
            # Demo mode / Fallback — deterministic based on text hash
            h = hash(text) % 100
            is_fake = h < 50
            conf = 0.55 + (h % 30) / 100
            raw_prob_fake = conf if is_fake else 1 - conf
            raw_prob_real = 1 - raw_prob_fake
            model_used = "demo_mode"

        # 2. Heuristic checks for confidence adjustment only
        text_lower = text.lower()
        heuristic_weight = 0.0
        matched_heuristics = []

        if any(p in text_lower for p in ["cures cancer", "cure cancer", "cures all", "miracle cure", "completely cures", "secret treatment", "cures instantly", "drinking bleach", "cure within"]):
            heuristic_weight += 0.40
            matched_heuristics.append("Miracle Cure/Unverified Medical Claim")

        if any(p in text_lower for p in ["government hides", "hiding this secret", "hiding from the public", "secret society", "hiding from you", "don't want you to know", "suppressed by", "big pharma", "hospitals are hiding"]):
            heuristic_weight += 0.35
            matched_heuristics.append("Conspiracy Framing/Secrecy Claim")

        if any(p in text_lower for p in ["share before deleted", "share before the government", "delete this", "must share", "spread this", "go viral", "share with everyone", "forward this", "copy and paste"]):
            heuristic_weight += 0.25
            matched_heuristics.append("Viral Sharing Pressure")

        if any(p in text_lower for p in ["breaking!!!", "breaking news", "you won't believe", "shocking", "unbelievable", "mind-blowing", "wake up sheeple", "scam", "hoax"]):
            heuristic_weight += 0.20
            matched_heuristics.append("Sensationalist Clickbait Phrasing")

        if "!!!" in text:
            heuristic_weight += 0.15
            matched_heuristics.append("Excessive Exclamation Marks (!!!)")
        elif "!" in text and text.count("!") > 3:
            heuristic_weight += 0.10
            matched_heuristics.append("Frequent Exclamations")

        all_caps_words = re.findall(r'\b[A-Z]{4,}\b', text)
        if len(all_caps_words) >= 3:
            heuristic_weight += 0.15
            matched_heuristics.append(f"Excessive CAPITALIZATION ({len(all_caps_words)} words)")

        h_score = min(heuristic_weight, 1.0)
        final_prob_fake = (0.6 * raw_prob_fake) + (0.4 * h_score)

        if ("Miracle Cure/Unverified Medical Claim" in matched_heuristics or "Conspiracy Framing/Secrecy Claim" in matched_heuristics) and h_score >= 0.4:
            final_prob_fake = max(final_prob_fake, 0.94)
            log.info("[HYBRID PENALTY] Medical/Conspiracy detected. Fake probability forced to >= 94%.")

        final_prob_real = 1.0 - final_prob_fake

        if final_prob_fake >= 0.5:
            prediction = "FAKE"
            confidence = final_prob_fake
        else:
            prediction = "REAL"
            confidence = final_prob_real

        suspicious_indicators, positive_indicators = cls._detect_indicators(text)
        explanation, indicators, positive_indicator_list = cls._build_explanation(
            prediction,
            text,
            suspicious_indicators,
            positive_indicators,
        )

        # Debug log
        log.info(f"""
[HYBRID PIPELINE DEBUG LOG]
Input Text: {text[:80]}...
RoBERTa/ML Raw: Fake={raw_prob_fake:.4f}, Real={raw_prob_real:.4f}
Heuristics Matched: {matched_heuristics} (Score contribution={h_score:.4f})
Final Hybrid Score: Fake={final_prob_fake:.4f}, Real={final_prob_real:.4f}
Decision: {prediction} with {confidence:.2%} confidence
""")

        return {
            "label": prediction,
            "confidence": round(confidence, 4),
            "prob_fake": round(final_prob_fake, 4),
            "prob_real": round(final_prob_real, 4),
            "model_used": f"{model_used}+heuristics" if matched_heuristics else model_used,
            "explanation": explanation,
            "indicators": indicators,
            "positive_indicators": positive_indicator_list,
        }

    @classmethod
    def predict(cls, req: PredictRequest) -> PredictResult:
        t0 = time.time()
        content = cls._build_input(req)
        res = cls._predict_one(content)
        res["latency_ms"] = round((time.time() - t0) * 1000, 2)
        return PredictResult(**res)
