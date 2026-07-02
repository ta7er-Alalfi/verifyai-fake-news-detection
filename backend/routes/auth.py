from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Body, Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models.user import User
from schemas.auth import (
    RegisterRequest, LoginRequest, GoogleAuthRequest, 
    TokenResponse, UserResponse, ProfileUpdateRequest, RefreshRequest
)
from services.auth_service import AuthService
from middleware.auth_middleware import get_current_user, blacklist_token, security
from middleware.rate_limiter import login_limiter, register_limiter
from middleware.security import sanitize_input

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(register_limiter)])
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Sanitize input strings
    username = sanitize_input(req.username)
    email = sanitize_input(req.email).lower()
    
    # Check if email already registered
    result = await db.execute(select(User).where(User.email == email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_pwd = AuthService.hash_password(req.password)
    new_user = User(
        email=email,
        username=username,
        hashed_password=hashed_pwd,
        provider="local",
        avatar_url=f"https://api.dicebear.com/7.x/bottts/svg?seed={username}"
    )
    
    db.add(new_user)
    await db.flush() # Populate user ID
    
    # Generate tokens
    access_token = AuthService.create_access_token({"sub": email})
    refresh_token = AuthService.create_refresh_token({"sub": email})
    
    # Commit transaction
    await db.commit()
    
    # Convert model to schema
    user_resp = UserResponse.model_validate(new_user)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_resp
    )

@router.post("/login", response_model=TokenResponse, dependencies=[Depends(login_limiter)])
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    email = sanitize_input(req.email).lower()
    
    # Get user
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if not user or user.provider != "local":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    # Verify password
    if not AuthService.verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is disabled"
        )
        
    # Update last login
    user.last_login = datetime.utcnow()
    await db.flush()
    
    access_token = AuthService.create_access_token({"sub": email})
    refresh_token = AuthService.create_refresh_token({"sub": email})
    
    await db.commit()
    
    user_resp = UserResponse.model_validate(user)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_resp
    )

@router.post("/google", response_model=TokenResponse, dependencies=[Depends(login_limiter)])
async def google_auth(req: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    # Verify token
    id_info = AuthService.verify_google_token(req.id_token)
    if not id_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token"
        )
        
    email = id_info.get("email").lower()
    name = id_info.get("name")
    picture = id_info.get("picture")
    
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if not user:
        # Create new Google user
        user = User(
            email=email,
            username=name or email.split("@")[0],
            provider="google",
            avatar_url=picture or f"https://api.dicebear.com/7.x/bottts/svg?seed={email}",
            is_active=True
        )
        db.add(user)
        await db.flush()
    else:
        # If user exists but registered locally, link provider to Google and update avatar
        if user.provider == "local":
            user.provider = "google"
            user.hashed_password = None
        if picture:
            user.avatar_url = picture
        user.last_login = datetime.utcnow()
        await db.flush()
        
    access_token = AuthService.create_access_token({"sub": email})
    refresh_token = AuthService.create_refresh_token({"sub": email})
    
    await db.commit()
    
    user_resp = UserResponse.model_validate(user)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user_resp
    )

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    refresh_token: Optional[str] = Body(None, embed=True),
):
    if credentials:
        blacklist_token(credentials.credentials)
    if refresh_token:
        blacklist_token(refresh_token)
    return {"detail": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_me(
    req: ProfileUpdateRequest, 
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if req.username:
        current_user.username = sanitize_input(req.username)
    if req.avatar_url:
        current_user.avatar_url = req.avatar_url
        
    await db.flush()
    await db.commit()
    return current_user

@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = AuthService.decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
        
    email = payload.get("sub")
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalars().first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
        
    access_token = AuthService.create_access_token({"sub": email})
    new_refresh_token = AuthService.create_refresh_token({"sub": email})
    
    user_resp = UserResponse.model_validate(user)
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user=user_resp
    )
