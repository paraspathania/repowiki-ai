import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime, ForeignKey, Enum as SQLEnum, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
import enum

from app.core.database import Base


class OAuthProvider(str, enum.Enum):
    GITHUB = "github"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[Optional[str]] = mapped_column(String(255), unique=True, index=True, nullable=True)
    display_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    oauth_accounts: Mapped[List["OAuthAccount"]] = relationship("OAuthAccount", back_populates="user", cascade="all, delete-orphan")
    repositories: Mapped[List["Repository"]] = relationship("Repository", back_populates="owner_user", cascade="all, delete-orphan")


class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    provider: Mapped[OAuthProvider] = mapped_column(SQLEnum(OAuthProvider), nullable=False)
    provider_user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    
    access_token_encrypted: Mapped[str] = mapped_column(String(1024), nullable=False)
    refresh_token_encrypted: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    scopes: Mapped[Optional[List[str]]] = mapped_column(ARRAY(String), nullable=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="oauth_accounts")
