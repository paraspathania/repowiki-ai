import uuid
from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List

from app.core.database import Base


class RepositoryDatabaseTable(Base):
    __tablename__ = "repository_database_tables"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    analysis_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("repository_analyses.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    source_file: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    columns: Mapped[List["RepositoryDatabaseColumn"]] = relationship(
        "RepositoryDatabaseColumn", back_populates="table", cascade="all, delete-orphan"
    )
    relationships: Mapped[List["RepositoryDatabaseRelationship"]] = relationship(
        "RepositoryDatabaseRelationship", back_populates="table", cascade="all, delete-orphan"
    )


class RepositoryDatabaseColumn(Base):
    __tablename__ = "repository_database_columns"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    table_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("repository_database_tables.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    data_type: Mapped[str] = mapped_column(String(128), default="string", nullable=False)
    is_primary_key: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_nullable: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_foreign_key: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    references_table: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    references_column: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    table: Mapped["RepositoryDatabaseTable"] = relationship("RepositoryDatabaseTable", back_populates="columns")


class RepositoryDatabaseRelationship(Base):
    __tablename__ = "repository_database_relationships"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    table_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("repository_database_tables.id", ondelete="CASCADE"), index=True, nullable=False)
    from_column: Mapped[str] = mapped_column(String(255), nullable=False)
    to_table: Mapped[str] = mapped_column(String(255), nullable=False)
    to_column: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(64), default="one_to_many", nullable=False)  # "one_to_one" | "one_to_many" | "many_to_many"
    is_ambiguous: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    table: Mapped["RepositoryDatabaseTable"] = relationship("RepositoryDatabaseTable", back_populates="relationships")
