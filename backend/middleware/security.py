import re
import html
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware that injects standard security headers into all HTTP responses."""
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Content Security Policy (CSP) - customized to allow local development and typical API backends
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https: http:; "
            "connect-src 'self' http://localhost:8000 http://localhost:3000 http://127.0.0.1:8000 http://127.0.0.1:3000 https:;"
        )
        return response

def sanitize_input(text: str) -> str:
    """Sanitizes text to prevent XSS (Cross-Site Scripting) attacks by removing HTML tags and escaping special characters."""
    if not text:
        return ""
    
    # Strip any HTML tags completely
    clean_html = re.sub(r'<[^>]*>', '', text)
    
    # Escape special characters like <, >, &, ", '
    escaped = html.escape(clean_html)
    
    return escaped.strip()
