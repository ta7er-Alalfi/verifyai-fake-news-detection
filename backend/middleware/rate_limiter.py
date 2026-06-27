import time
from typing import Dict, List
from fastapi import Request, HTTPException, status
from config import settings

class RateLimitDependency:
    def __init__(self, limit: int, window_seconds: int = 60):
        self.limit = limit
        self.window_seconds = window_seconds
        # Stores client_host -> list of request timestamps
        self.history: Dict[str, List[float]] = {}

    async def __call__(self, request: Request):
        # Identify client by IP
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Get active requests in the sliding window
        timestamps = self.history.get(client_ip, [])
        timestamps = [t for t in timestamps if now - t < self.window_seconds]
        
        if len(timestamps) >= self.limit:
            retry_after = int(self.window_seconds - (now - timestamps[0]))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please try again later.",
                headers={"Retry-After": str(max(1, retry_after))}
            )
            
        timestamps.append(now)
        self.history[client_ip] = timestamps

# Pre-defined limiters based on config settings
login_limiter = RateLimitDependency(limit=settings.RATE_LIMIT_LOGIN_PER_MIN, window_seconds=60)
register_limiter = RateLimitDependency(limit=settings.RATE_LIMIT_REGISTER_PER_MIN, window_seconds=60)
predict_limiter = RateLimitDependency(limit=settings.RATE_LIMIT_PREDICT_PER_MIN, window_seconds=60)
chat_limiter = RateLimitDependency(limit=settings.RATE_LIMIT_CHAT_PER_MIN, window_seconds=60)
