import uuid
from sqlalchemy import String, BigInteger, Integer, Boolean, Float, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List

from app.core.database import Base


class RepositoryFile(Base):
    __tablename__ = "repository_files"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    analysis_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("repository_analyses.id", ondelete="CASCADE"), index=True)
    
    path: Mapped[str] = mapped_column(Text, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    extension: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    language: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    
    size_bytes: Mapped[int] = mapped_column(BigInteger, default=0)
    line_count: Mapped[int] = mapped_column(Integer, default=0)
    content_hash: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    
    is_binary: Mapped[bool] = mapped_column(Boolean, default=False)
    is_generated: Mapped[bool] = mapped_column(Boolean, default=False)
    importance_score: Mapped[float] = mapped_column(Float, default=0.0)

    __table_args__ = (
        UniqueConstraint("analysis_id", "path", name="uq_analysis_file_path"),
    )

    analysis: Mapped["RepositoryAnalysis"] = relationship("RepositoryAnalysis", back_populates="files")
    symbols: Mapped[List["RepositorySymbol"]] = relationship("RepositorySymbol", back_populates="file", cascade="all, delete-orphan")
