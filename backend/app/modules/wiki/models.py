import uuid
from sqlalchemy import String, Integer, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.core.database import Base

class Wiki(Base):
    __tablename__ = "wikis"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    repository_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("repositories.id", ondelete="CASCADE"), unique=True, nullable=False)
    analysis_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("repository_analyses.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="generating", nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    sections: Mapped[List["WikiSection"]] = relationship("WikiSection", back_populates="wiki", cascade="all, delete-orphan", order_by="WikiSection.order_index")

class WikiSection(Base):
    __tablename__ = "wiki_sections"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    wiki_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("wikis.id", ondelete="CASCADE"), nullable=False)
    slug: Mapped[str] = mapped_column(String(128), nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="generating", nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    citations: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    wiki: Mapped["Wiki"] = relationship("Wiki", back_populates="sections")
