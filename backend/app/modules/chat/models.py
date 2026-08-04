import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, Integer, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.core.database import Base

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    repository_id = Column(UUID(as_uuid=True), ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

    __table_args__ = (
        Index("idx_chat_sessions_repo", repository_id, created_at.desc()),
    )

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(32), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    session = relationship("ChatSession", back_populates="messages")
    citations = relationship("ChatCitation", back_populates="message", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_chat_messages_session", session_id, created_at),
    )

class ChatCitation(Base):
    __tablename__ = "chat_citations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("chat_messages.id", ondelete="CASCADE"), nullable=False)
    chunk_id = Column(UUID(as_uuid=True), ForeignKey("code_chunks.id", ondelete="SET NULL"), nullable=True)
    path = Column(String(2048), nullable=False)
    start_line = Column(Integer, nullable=True)
    end_line = Column(Integer, nullable=True)
    validated = Column(Boolean, server_default="true", nullable=False)

    message = relationship("ChatMessage", back_populates="citations")
