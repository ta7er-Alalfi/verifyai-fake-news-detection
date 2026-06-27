import logging
from typing import List, Optional, Tuple
from datetime import datetime
from config import settings

log = logging.getLogger("chatbot-service")

# Try importing Gemini API SDK
try:
    import google.generativeai as genai
    _HAS_GEMINI = True
except ImportError:
    _HAS_GEMINI = False
    genai = None

class ChatbotService:
    _gemini_initialized = False

    @classmethod
    def initialize(cls):
        if not settings.GEMINI_API_KEY:
            log.warning("Gemini API key not found — using demo mode")
            return

        if _HAS_GEMINI and not cls._gemini_initialized:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                cls._gemini_initialized = True
                log.info("✅ Gemini API initialized successfully")
                log.info("[SUCCESS] Gemini API initialized successfully")
            except Exception as e:
                log.error(f"❌ Failed to initialize Gemini API: {e}")
                log.error(f"[ERROR] Failed to initialize Gemini API: {e}")

    @classmethod
    async def generate_response(
        cls, 
        message: str, 
        chat_history: Optional[List[dict]] = None, 
        prediction_history: Optional[List[dict]] = None
    ) -> Tuple[str, bool]:
        """
        Generate AI chatbot response using Gemini API, with a context-aware fallback.
        Returns:
            Tuple[response_text, context_used]
        """
        cls.initialize()
        
        # Prepare context from prediction history if available
        context_str = ""
        context_used = False
        if prediction_history and len(prediction_history) > 0:
            context_used = True
            history_lines = []
            for i, p in enumerate(prediction_history[:3]): # last 3 predictions
                title = p.get('title') or "Untitled"
                label = p.get('label')
                conf = p.get('confidence', 0.0) * 100
                snippet = p.get('text_snippet', '')[:100]
                history_lines.append(
                    f"- \"{title}\" (Snippet: {snippet}...): Classified as {label} with {conf:.1f}% confidence."
                )
            
            context_str = (
                "\n\n[USER PREDICTION CONTEXT]\n"
                "The user has recently analyzed the following articles using our classifier:\n"
                + "\n".join(history_lines) + "\n"
                "Use this history to answer any of their questions about their results, or reference it to explain why certain indicators (like loaded language or formatting) might cause an article to be flagged."
            )

        # 1. Use real Gemini API if initialized
        if cls._gemini_initialized and _HAS_GEMINI:
            try:
                # System prompt instructions
                system_instruction = (
                    "You are VerifyAI Assistant, an expert AI chatbot specializing in fake news detection, media literacy, "
                    "and critical information analysis. Your goal is to guide users to think critically about the news they consume. "
                    "Be polite, professional, and clear. Avoid taking political sides. "
                    "Use formatting (bolding, lists, markdown) to make your answers structured and readable."
                )
                
                # We use gemini-1.5-flash as it is fast and supports system instructions
                model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    system_instruction=system_instruction
                )
                
                # Construct the prompt including history and prediction context
                prompt_parts = []
                
                # Append recent chat history if provided
                if chat_history:
                    prompt_parts.append("Recent Chat History:")
                    for msg in chat_history[-6:]: # Limit to last 6 messages
                        role_name = "User" if msg.get("role") == "user" else "Assistant"
                        prompt_parts.append(f"{role_name}: {msg.get('content')}")
                    prompt_parts.append("---")
                
                if context_str:
                    prompt_parts.append(context_str)
                    
                prompt_parts.append(f"User: {message}")
                prompt_parts.append("Assistant:")
                
                full_prompt = "\n".join(prompt_parts)
                
                response = model.generate_content(full_prompt)
                return response.text.strip(), context_used
                
            except Exception as e:
                log.error(f"Gemini generation error: {e}. Falling back to demo mode.")

        # 2. Local Fallback Demo Mode (Keyword Matching)
        return cls._demo_response(message, context_str, context_used)

    @classmethod
    def _demo_response(cls, message: str, context_str: str, context_used: bool) -> Tuple[str, bool]:
        msg_lower = message.lower()
        
        # Base responses
        if "hello" in msg_lower or "hi" in msg_lower or "أهلاً" in msg_lower or "مرحبا" in msg_lower:
            reply = (
                "👋 **Welcome to VerifyAI Assistant!**\n\n"
                "I am your media literacy assistant. You can ask me how to detect fake news, how our RoBERTa model works, "
                "or details about your prediction history! How can I help you today?"
            )
        elif "prediction" in msg_lower or "history" in msg_lower or "تاريخ" in msg_lower or "توقع" in msg_lower or "results" in msg_lower:
            if context_used:
                reply = (
                    "📊 **Analyzing your prediction history:**\n\n"
                    f"Based on your recent predictions: {context_str}\n\n"
                    "It looks like you've been active! You can review details of these articles directly on your dashboard. "
                    "Remember, a high confidence score from our RoBERTa model means the model detected structural patterns matching known "
                    "datasets of real/fake news (such as emotional adjectives, sensational punctuation, or clickbait styling)."
                )
            else:
                reply = (
                    "📊 **Prediction History**\n\n"
                    "You haven't run any predictions in this session yet, or you are not logged in. "
                    "Try pasting a news article in the **Analyze** page, and I'll be able to explain the classification results!"
                )
        elif "model" in msg_lower or "roberta" in msg_lower or "how it works" in msg_lower or "كيف يعمل" in msg_lower or "النموذج" in msg_lower:
            reply = (
                "🤖 **How the AI Model Works**\n\n"
                "Our application utilizes a dual-model approach:\n"
                "1. **RoBERTa (Robustly Optimized BERT Approach)**: A state-of-the-art transformer model fine-tuned on a hybrid dataset of 40,000+ real and fake news articles. It reads contextual patterns and semantic structure.\n"
                "2. **TF-IDF + Logistic Regression**: A fast statistical baseline model that analyzes word frequencies.\n\n"
                "When you submit a text, we process it and give you a probability score. Scores near 100% indicate strong match characteristics."
            )
        elif "how to spot" in msg_lower or "tips" in msg_lower or "detect" in msg_lower or "نصائح" in msg_lower or "كشف" in msg_lower:
            reply = (
                "🔍 **Quick Tips for Spotting Fake News**:\n\n"
                "- **Check the Source**: Is it a reputable news agency, or a blog with typos in the URL?\n"
                "- **Read Beyond the Headline**: Headlines are often exaggerated (clickbait) to get clicks.\n"
                "- **Check the Date**: Old stories are sometimes reposted to make them look like current events.\n"
                "- **Inspect Supporting Sources**: Does the article cite expert testimony or official records?\n"
                "- **Look out for Loaded Language**: Heavy emotional appeal (e.g., 'Shocking!', 'Must share!') is a common indicator of propaganda."
            )
        else:
            # Context-aware general reply
            context_added = ""
            if context_used:
                context_added = (
                    "\n\n*Note: I see you've analyzed some articles recently (e.g. on your Dashboard). "
                    "If you have questions about specific results, just let me know!*"
                )
            reply = (
                "🤖 **VerifyAI Assistant (Demo Mode)**\n\n"
                "Thank you for your question! I am running in **Demo Mode** because a Gemini API key is not configured yet. "
                "However, I can still guide you! You can ask me about:\n"
                "- How our RoBERTa model predicts fake news.\n"
                "- Practical tips to spot misinformation.\n"
                "- Details about your recent predictions."
                f"{context_added}"
            )
            
        return reply, context_used
