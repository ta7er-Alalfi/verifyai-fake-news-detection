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
                log.info("[SUCCESS] Gemini API initialized successfully")
                log.info("[SUCCESS] Gemini API initialized successfully")
            except Exception as e:
                log.error(f"[ERROR] Failed to initialize Gemini API: {e}")
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
        response_text, context_used = cls._demo_response(message, context_str, context_used)
        log.info("Using demo fallback response for message: %s", message)
        return response_text, context_used

    @classmethod
    def _demo_response(cls, message: str, context_str: str, context_used: bool) -> Tuple[str, bool]:
        msg_lower = message.lower()
        
        # Specific question patterns
        if any(word in msg_lower for word in ["bleach", "clorox", "sodium hypochlorite", "not a cure", "cure"]):
            reply = (
                "🚫 **Bleach is not a cure.**\n\n"
                "Bleach is a dangerous chemical that can harm your skin, eyes, and lungs. It is not safe to ingest or apply to the body, and there is no scientific evidence that it cures diseases or infections. "
                "Fake cures like this are often spread because they sound urgent or dramatic, but they are unsafe and unproven."
            )
        elif any(word in msg_lower for word in ["identify fake news", "real news", "spot fake news", "how can i identify fake news", "how to tell", "detect fake news"]):
            reply = (
                "🔎 **How to identify fake news**\n\n"
                "1. Check the source: trusted news organizations usually cite verifiable evidence and expert opinions.\n"
                "2. Verify quotes and facts: see if other credible outlets report the same story.\n"
                "3. Watch for emotional language or bold claims with no proof.\n"
                "4. Look for supporting details: credible stories include names, dates, locations, and references.\n"
                "5. Ask yourself if the article seems designed to provoke fear or anger rather than inform."
            )
        elif any(word in msg_lower for word in ["why do people spread fake news", "people spread fake news", "spread fake news", "why do people spread"]):
            reply = (
                "🧠 **Why people spread fake news**\n\n"
                "People share fake news for different reasons: sometimes they want attention, sometimes they are emotionally triggered, and sometimes they believe the story is true. "
                "Other times it is shared to influence opinions, increase website traffic, or manipulate public sentiment. "
                "The more a story appeals to fear or anger, the more likely it is to spread quickly."
            )
        elif "hello" in msg_lower or "hi" in msg_lower or "أهلاً" in msg_lower or "مرحبا" in msg_lower:
            reply = (
                "👋 **Hello! I'm VerifyAI Assistant.**\n\n"
                "Ask me about fake news detection, why some stories are unreliable, or how our system analyzes content. "
                "For example, you can ask: 'Why is bleach not a cure?' or 'How can I identify fake news?'"
            )
        elif any(word in msg_lower for word in ["model", "roberta", "how it works", "كيف يعمل", "النموذج"]):
            reply = (
                "🤖 **How our model works**\n\n"
                "This app uses a fine-tuned RoBERTa model to detect patterns in text that often appear in fake or misleading news. "
                "It also combines those results with heuristic checks for language style, sources, and claims. "
                "If the text looks sensational, overly emotional, or unsupported, it is more likely to be flagged."
            )
        elif any(word in msg_lower for word in ["tips", "detect", "how to spot", "نصائح", "كشف"]):
            reply = (
                "✅ **Tips for spotting fake news**\n\n"
                "- Check the headline carefully: if it seems too extreme or unbelievable, verify it first.\n"
                "- Look for credible sources or linked evidence.\n"
                "- Compare the story with other trusted news sites.\n"
                "- Be cautious of content that asks you to share it quickly or promises a miracle cure."
            )
        else:
            reply_templates = [
                (
                    "📘 **I can help explain that.**\n\n"
                    "Fake news often uses emotional triggers and weak sources. If you want, I can walk you through a checklist for evaluating any story."
                ),
                (
                    "💡 **Good question.**\n\n"
                    "If you're unsure whether a story is real, check the source, the evidence, and whether multiple trustworthy outlets report it. "
                    "I can also help you interpret specific claims."
                ),
                (
                    "📰 **Interesting point.**\n\n"
                    "Many misleading stories rely on vague claims, anonymous sources, or dramatic language. "
                    "Focus on whether the article cites verifiable facts before trusting it."
                )
            ]
            idx = abs(hash(msg_lower)) % len(reply_templates)
            reply = reply_templates[idx]

            if context_used:
                reply += (
                    "\n\n*I also noticed your recent predictions: they can help me explain this kind of question more accurately if you want to share a specific example.*"
                )

        return reply, context_used
