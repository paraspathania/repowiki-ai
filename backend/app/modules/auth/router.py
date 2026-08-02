import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.api.dependencies import get_current_user
from app.modules.auth.models import User, OAuthAccount, OAuthProvider
from app.modules.auth.schemas import UserOut, AuthResponse, LoginRequest, RegisterRequest
from app.providers.github.client import GitHubClient

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == req.email)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=req.email,
        display_name=req.display_name or req.email.split("@")[0],
        hashed_password=get_password_hash(req.password),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id)
    return AuthResponse(token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=AuthResponse)
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == req.email)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user or not user.hashed_password or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(user.id)
    return AuthResponse(token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.post("/logout")
async def logout():
    return {"message": "Logged out successfully"}


@router.get("/github")
async def github_login():
    if not settings.GITHUB_CLIENT_ID:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="GitHub OAuth client ID not configured")
    
    url = f"https://github.com/login/oauth/authorize?client_id={settings.GITHUB_CLIENT_ID}&redirect_uri={settings.GITHUB_REDIRECT_URI}&scope=repo,read:user,user:email"
    return RedirectResponse(url=url)


@router.get("/github/callback")
async def github_callback(code: str = Query(...), db: AsyncSession = Depends(get_db)):
    if not settings.GITHUB_CLIENT_ID or not settings.GITHUB_CLIENT_SECRET:
        raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="GitHub OAuth credentials not configured")

    # 1. Exchange code for access token
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": settings.GITHUB_CLIENT_ID,
                "client_secret": settings.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": settings.GITHUB_REDIRECT_URI,
            },
        )
        data = res.json()
        access_token = data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to retrieve GitHub access token")

    # 2. Fetch user profile from GitHub
    gh_client = GitHubClient(access_token=access_token)
    gh_user = await gh_client.get_user_profile()

    # 3. Find or create user
    stmt = select(OAuthAccount).where(
        OAuthAccount.provider == OAuthProvider.GITHUB,
        OAuthAccount.provider_user_id == str(gh_user.id),
    )
    res = await db.execute(stmt)
    oauth_acc = res.scalar_one_or_none()

    if oauth_acc:
        user = await db.get(User, oauth_acc.user_id)
        oauth_acc.access_token_encrypted = access_token
    else:
        user = User(
            email=gh_user.email,
            display_name=gh_user.name or gh_user.login,
            avatar_url=gh_user.avatar_url,
        )
        db.add(user)
        await db.flush()

        oauth_acc = OAuthAccount(
            user_id=user.id,
            provider=OAuthProvider.GITHUB,
            provider_user_id=str(gh_user.id),
            access_token_encrypted=access_token,
            scopes=["repo", "read:user", "user:email"],
        )
        db.add(oauth_acc)

    await db.commit()
    await db.refresh(user)

    token = create_access_token(user.id)
    return AuthResponse(token=token, user=UserOut.model_validate(user))
