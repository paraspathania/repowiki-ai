"""code chunks and embeddings with pgvector support

Revision ID: 002_code_chunks_embeddings
Revises: 001_initial_schema
Create Date: 2026-08-02

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '002_code_chunks_embeddings'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension first
    op.execute(sa.text("CREATE EXTENSION IF NOT EXISTS vector"))

    # Code Chunks
    op.create_table(
        'code_chunks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('repository_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('repositories.id', ondelete='CASCADE'), nullable=False),
        sa.Column('analysis_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('repository_analyses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('file_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('repository_files.id', ondelete='SET NULL'), nullable=True),
        sa.Column('path', sa.String(2048), nullable=False),
        sa.Column('language', sa.String(64), nullable=False),
        sa.Column('symbol_name', sa.String(512), nullable=True),
        sa.Column('symbol_type', sa.String(64), nullable=True),
        sa.Column('start_line', sa.Integer(), nullable=False),
        sa.Column('end_line', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('content_hash', sa.String(64), nullable=False),
        sa.Column('token_count', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_code_chunks_repo_analysis', 'code_chunks', ['repository_id', 'analysis_id'])
    op.create_index('idx_code_chunks_path', 'code_chunks', ['repository_id', 'path'])

    # Embeddings — store as TEXT initially, then ALTER to vector(1536)
    op.create_table(
        'embeddings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('chunk_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('code_chunks.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('repository_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('repositories.id', ondelete='CASCADE'), nullable=False),
        sa.Column('analysis_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('repository_analyses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('embedding', sa.Text(), nullable=True),
        sa.Column('model', sa.String(128), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    )

    # Convert embedding column to vector(1536) type
    op.execute(sa.text("ALTER TABLE embeddings ALTER COLUMN embedding TYPE vector(1536) USING NULL::vector(1536)"))

    # Create HNSW index (must be outside transaction for CONCURRENTLY, but inside for simplicity in Alembic)
    op.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS idx_embeddings_hnsw "
        "ON embeddings USING hnsw (embedding vector_cosine_ops) "
        "WITH (m = 16, ef_construction = 64)"
    ))
    # Index for repository scoping
    op.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS idx_embeddings_repo_analysis "
        "ON embeddings (repository_id, analysis_id)"
    ))


def downgrade() -> None:
    op.execute(sa.text("DROP INDEX IF EXISTS idx_embeddings_hnsw"))
    op.execute(sa.text("DROP INDEX IF EXISTS idx_embeddings_repo_analysis"))
    op.drop_table('embeddings')
    op.drop_index('idx_code_chunks_path', table_name='code_chunks')
    op.drop_index('idx_code_chunks_repo_analysis', table_name='code_chunks')
    op.drop_table('code_chunks')
