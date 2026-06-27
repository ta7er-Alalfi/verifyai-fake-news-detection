import os
import time
import logging
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
import jwt
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from config import settings

log = logging.getLogger(__name__)


class AuthService:

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt."""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
        return hashed.decode("utf-8")

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify bcrypt password."""
        try:
            return bcrypt.checkpw(
                plain_password.encode("utf-8"),
                hashed_password.encode("utf-8")
            )
        except Exception:
            return False

    @staticmethod
    def create_access_token(
        data: dict,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token."""

        to_encode = data.copy()

        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )

        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })

        token = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )

        return token

    @staticmethod
    def create_refresh_token(
        data: dict,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT refresh token."""

        to_encode = data.copy()

        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                days=settings.REFRESH_TOKEN_EXPIRE_DAYS
            )

        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        })

        token = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )

        return token

    @staticmethod
    def decode_token(token: str) -> Optional[dict]:
        """Decode and validate JWT token."""

        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM]
            )

            return payload

        except jwt.ExpiredSignatureError:
            log.warning("JWT token expired")
            return None

        except jwt.InvalidTokenError:
            log.warning("Invalid JWT token")
            return None

        except Exception as e:
            log.error(f"Token decode error: {e}")
            return None

    @staticmethod
    def verify_google_token(token: str) -> Optional[dict]:
        """Verify Google OAuth token."""
        if token.startswith("mock_"):
            parts = token.split("_")
            email = parts[1] if len(parts) > 1 else "demo_google@gmail.com"
            name = parts[2] if len(parts) > 2 else "Demo Google User"
            avatar = "https://api.dicebear.com/7.x/bottts/svg?seed=" + email
            return {
                "email": email,
                "name": name,
                "picture": avatar,
                "sub": f"google-oauth2|{email}"
            }

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )

            return {
                "email": idinfo.get("email"),
                "name": idinfo.get("name"),
                "picture": idinfo.get("picture"),
                "sub": idinfo.get("sub")
            }

        except Exception as e:
            log.error(f"Google Token Verification Error: {e}")
            return None
