import uuid
from sqlalchemy import String, Integer, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List
import enum

from app.core.database import Base


class SymbolType(str, enum.Enum):
    FUNCTION = "function"
    CLASS = "class"
    METHOD = "method"
    INTERFACE = "interface"
    VARIABLE = "variable"
    IMPORT = "import"
    DECORATOR = "decorator"


class RepositorySymbol(Base):
    __tablename__ = "repository_symbols"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    file_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("repository_files.id", ondelete="CASCADE"), index=True)
    
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    qualified_name: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    symbol_type: Mapped[SymbolType] = mapped_column(SQLEnum(SymbolType, native_enum=False), nullable=False, index=True)
    
    start_line: Mapped[int] = mapped_column(Integer, nullable=False)
    end_line: Mapped[int] = mapped_column(Integer, nullable=False)
    signature: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    parent_symbol_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("repository_symbols.id", ondelete="SET NULL"), nullable=True)

    file: Mapped["RepositoryFile"] = relationship("RepositoryFile", back_populates="symbols")
