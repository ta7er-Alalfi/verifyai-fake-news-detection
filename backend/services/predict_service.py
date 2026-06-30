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

        # 2. Heuristic checks
        text_lower = text.lower()
        heuristic_weight = 0.0
        matched_heuristics = []
        explanation_parts = []

        # 2.1 Miracle cures / medical fake news
        miracle_patterns = [
            "cures cancer", "cure cancer", "cures all", "miracle cure",
            "completely cures", "secret treatment", "cures instantly",
            "drinking bleach", "cure within"
        ]
        if any(p in text_lower for p in miracle_patterns):
            heuristic_weight += 0.40
            matched_heuristics.append("Miracle Cure/Unverified Medical Claim")
            explanation_parts.append("an unverified medical miracle claim (e.g. curing cancer or illnesses instantly)")

        # 2.2 Conspiracy / Secrecy claims
        conspiracy_patterns = [
            "government hides", "hiding this secret", "hiding from the public",
            "secret society", "hiding from you", "don't want you to know",
            "suppressed by", "big pharma", "hospitals are hiding"
        ]
        if any(p in text_lower for p in conspiracy_patterns):
            heuristic_weight += 0.35
            matched_heuristics.append("Conspiracy Framing/Secrecy Claim")
            explanation_parts.append("conspiracy framing asserting that authorities or organizations are intentionally hiding secrets")

        # 2.3 Viral pressure / Sharing urgency
        viral_patterns = [
            "share before deleted", "share before the government", "delete this",
            "must share", "spread this", "go viral", "share with everyone",
            "forward this", "copy and paste"
        ]
        if any(p in text_lower for p in viral_patterns):
            heuristic_weight += 0.25
            matched_heuristics.append("Viral Sharing Pressure")
            explanation_parts.append("urgent language designed to force social sharing before it gets 'deleted'")

        # 2.4 Sensationalism / Clickbait words
        clickbait_patterns = [
            "breaking!!!", "breaking news", "you won't believe", "shocking",
            "unbelievable", "mind-blowing", "wake up sheeple", "scam", "hoax"
        ]
        if any(p in text_lower for p in clickbait_patterns):
            heuristic_weight += 0.20
            matched_heuristics.append("Sensationalist Clickbait Phrasing")
            explanation_parts.append("sensationalist clickbait terms meant to trigger strong emotional responses")

        # 2.5 Excessive punctuation
        if "!!!" in text:
            heuristic_weight += 0.15
            matched_heuristics.append("Excessive Exclamation Marks (!!!)")
            explanation_parts.append("excessive exclamation marks indicating sensationalism")
        elif "!" in text and text.count("!") > 3:
            heuristic_weight += 0.10
            matched_heuristics.append("Frequent Exclamations")
            explanation_parts.append("frequent use of exclamations to inflate importance")

        # 2.6 All Caps words (excluding acronyms)
        all_caps_words = re.findall(r'\b[A-Z]{4,}\b', text)
        if len(all_caps_words) >= 3:
            heuristic_weight += 0.15
            matched_heuristics.append(f"Excessive CAPITALIZATION ({len(all_caps_words)} words)")
            explanation_parts.append("excessive capitalization resembling shouting or sensational headlines")

        # 3. Hybrid fusion
        h_score = min(heuristic_weight, 1.0)

        # Calculate weighted average
        final_prob_fake = (0.6 * raw_prob_fake) + (0.4 * h_score)

        # Medical/Conspiracy Penalty override
        if ("Miracle Cure/Unverified Medical Claim" in matched_heuristics or "Conspiracy Framing/Secrecy Claim" in matched_heuristics) and h_score >= 0.4:
            # Heavily penalize and force classification as Fake
            final_prob_fake = max(final_prob_fake, 0.94)
            log.info("[HYBRID PENALTY] Medical/Conspiracy detected. Fake probability forced to >= 94%.")

        final_prob_real = 1.0 - final_prob_fake

        # Determine final prediction
        if final_prob_fake >= 0.5:
            prediction = "FAKE"
            confidence = final_prob_fake
        else:
            prediction = "REAL"
            confidence = final_prob_real

        # 4. Generate dynamic explanation
        if prediction == "FAKE":
            if matched_heuristics:
                reasons_str = "; ".join(matched_heuristics)
                explanation = (
                    f"This article has been classified as FAKE because it exhibits strong indicators of misinformation: "
                    f"{', '.join(explanation_parts)}. Specific patterns identified: {reasons_str}."
                )
            else:
                explanation = (
                    "This article has been classified as FAKE. The neural patterns detected by our model indicate "
                    "contextual similarities to known datasets of misinformation and propaganda."
                )
        else:
            if matched_heuristics:
                reasons_str = "; ".join(matched_heuristics)
                explanation = (
                    f"This article is classified as REAL, but caution is advised. While the model suggests a factual structure, "
                    f"we detected some sensational elements: {reasons_str}."
                )
            else:
                explanation = (
                    "This article is classified as REAL. The text structure, vocabulary choice, and neutral tone "
                    "align with standard credible journalism and factual reporting."
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
            "explanation": explanation
        }

    @classmethod
    def predict(cls, req: PredictRequest) -> PredictResult:
        t0 = time.time()
        content = cls._build_input(req)
        res = cls._predict_one(content)
        res["latency_ms"] = round((time.time() - t0) * 1000, 2)
        return PredictResult(**res)
