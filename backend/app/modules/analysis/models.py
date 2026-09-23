import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Integer, SmallInteger, DateTime, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
import enum

from app.core.database import Base


class AnalysisStatus(str, enum.Enum):
    QUEUED = "queued"
    VALIDATING = "validating"
    CLONING = "cloning"
    SCANNING = "scanning"
    PARSING = "parsing"
    INDEXING = "indexing"
    GENERATING = "generating"
    COMPLETED = "completed"
    PARTIAL = "partial"
    FAILED = "failed"
    CANCELLED = "cancelled"


class RepositoryAnalysis(Base):
    __tablename__ = "repository_analyses"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    repository_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("repositories.id", ondelete="CASCADE"), index=True)
    
    branch: Mapped[str] = mapped_column(String(255), default="main")
    commit_sha: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    selected_path: Mapped[str] = mapped_column(Text, default="/")
    
    status: Mapped[AnalysisStatus] = mapped_column(SQLEnum(AnalysisStatus, native_enum=False), default=AnalysisStatus.QUEUED, index=True)
    progress: Mapped[int] = mapped_column(SmallInteger, default=0)
    
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    failure_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    parser_version: Mapped[str] = mapped_column(String(32), default="1.0.0")
    analysis_version: Mapped[str] = mapped_column(String(32), default="1.0.0")

    repository: Mapped["Repository"] = relationship("Repository", back_populates="analyses")
    jobs: Mapped[List["AnalysisJob"]] = relationship("AnalysisJob", back_populates="analysis", cascade="all, delete-orphan")
    files: Mapped[List["RepositoryFile"]] = relationship("RepositoryFile", back_populates="analysis", cascade="all, delete-orphan")


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    analysis_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("repository_analyses.id", ondelete="CASCADE"), index=True)
    
    stage: Mapped[str] = mapped_column(String(64), nullable=False)
    celery_task_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[AnalysisStatus] = mapped_column(SQLEnum(AnalysisStatus, native_enum=False), default=AnalysisStatus.QUEUED)
    attempt: Mapped[int] = mapped_column(Integer, default=1)
    progress: Mapped[int] = mapped_column(SmallInteger, default=0)
    
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    error_code: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    analysis: Mapped["RepositoryAnalysis"] = relationship("RepositoryAnalysis", back_populates="jobs")
