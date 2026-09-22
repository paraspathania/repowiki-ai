import uuid
from datetime import datetime, timezone
from sqlalchemy import String, BigInteger, Integer, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
import enum

from app.core.database import Base


class RepositoryVisibility(str, enum.Enum):
    PUBLIC = "public"
    PRIVATE = "private"


class Repository(Base):
    __tablename__ = "repositories"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    owner_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    github_repository_id: Mapped[int] = mapped_column(BigInteger, index=True, nullable=False)
    
    owner: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(512), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    visibility: Mapped[RepositoryVisibility] = mapped_column(SQLEnum(RepositoryVisibility), default=RepositoryVisibility.PUBLIC)
    default_branch: Mapped[str] = mapped_column(String(255), default="main")
    github_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    
    stars: Mapped[int] = mapped_column(Integer, default=0)
    forks: Mapped[int] = mapped_column(Integer, default=0)
    size_bytes: Mapped[int] = mapped_column(BigInteger, default=0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    owner_user: Mapped[Optional["User"]] = relationship("User", back_populates="repositories")
    analyses: Mapped[List["RepositoryAnalysis"]] = relationship("RepositoryAnalysis", back_populates="repository", cascade="all, delete-orphan")

    @property
    def is_private(self) -> bool:
        return self.visibility == RepositoryVisibility.PRIVATE or str(self.visibility).lower() == "private"

