import uuid
from sqlalchemy import String, Integer, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional

from app.core.database import Base


class RepositoryAPI(Base):
    __tablename__ = "repository_apis"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    analysis_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("repository_analyses.id", ondelete="CASCADE"), index=True)
    file_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("repository_files.id", ondelete="CASCADE"), index=True)
    
    method: Mapped[str] = mapped_column(String(16), nullable=False)
    route: Mapped[str] = mapped_column(Text, nullable=False)
    handler: Mapped[str] = mapped_column(String(255), nullable=False)
    
    start_line: Mapped[int] = mapped_column(Integer, nullable=False)
    end_line: Mapped[int] = mapped_column(Integer, nullable=False)
    
    authentication_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    request_schema: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    response_schema: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
