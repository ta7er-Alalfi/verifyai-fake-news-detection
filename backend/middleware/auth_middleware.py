from typing import Optional, Set
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models.user import User
from services.auth_service import AuthService

# Bearer security scheme
security = HTTPBearer(auto_error=False)

# In-memory blacklist for logged-out JWT tokens
# For a production multi-server setup, Redis would be used. For this app, an in-memory set is perfect.
TOKEN_BLACKLIST: Set[str] = set()

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Dependency that gets the current authenticated user from JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not credentials:
        raise credentials_exception
        
    token = credentials.credentials
    
    # Check blacklist
    if token in TOKEN_BLACKLIST:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked (logged out)",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    payload = AuthService.decode_token(token)
    if not payload:
        raise credentials_exception
        
    email: str = payload.get("sub")
    token_type: str = payload.get("type")
    
    if email is None or token_type != "access":
        raise credentials_exception
        
    # Get user from database
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
        
    return user

async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Dependency that returns the user if authenticated, or None if anonymous."""
    if not credentials:
        return None
        
    token = credentials.credentials
    if token in TOKEN_BLACKLIST:
        return None
        
    payload = AuthService.decode_token(token)
    if not payload:
        return None
        
    email = payload.get("sub")
    token_type = payload.get("type")
    
    if email is None or token_type != "access":
        return None
        
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if user and user.is_active:
        return user
        
    return None

def blacklist_token(token: str):
    """Revoke a token by adding it to the blacklist."""
    TOKEN_BLACKLIST.add(token)
