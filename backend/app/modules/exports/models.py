import uuid
from sqlalchemy import String, BigInteger, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from typing import Optional

from app.core.database import Base

class Export(Base):
    __tablename__ = "exports"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    repository_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    format: Mapped[str] = mapped_column(String(32), nullable=False)  # 'markdown' | 'pdf'
    status: Mapped[str] = mapped_column(String(32), default="pending", nullable=False)
    
    file_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    file_size_bytes: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
