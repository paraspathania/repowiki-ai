import uuid
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional

from app.core.database import Base


class RepositoryDependency(Base):
    __tablename__ = "repository_dependencies"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    analysis_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("repository_analyses.id", ondelete="CASCADE"), index=True, nullable=False)
    
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    version: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    type: Mapped[str] = mapped_column(String(32), default="production", nullable=False)  # "production" | "dev"
    language: Mapped[str] = mapped_column(String(64), nullable=False)                    # "Python" | "JavaScript" | "Go"
    file_path: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
