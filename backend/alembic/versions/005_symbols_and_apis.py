"""symbols and apis tables

Revision ID: 005_symbols_and_apis
Revises: 004
Create Date: 2026-08-02

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '005_symbols_and_apis'
down_revision: Union[str, None] = '004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # repository_symbols table
    op.create_table(
        'repository_symbols',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('file_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('repository_files.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('qualified_name', sa.Text(), nullable=False),
        sa.Column('symbol_type', sa.String(64), nullable=False),
        sa.Column('start_line', sa.Integer(), nullable=False),
        sa.Column('end_line', sa.Integer(), nullable=False),
        sa.Column('signature', sa.Text(), nullable=True),
        sa.Column('parent_symbol_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('repository_symbols.id', ondelete='SET NULL'), nullable=True),
    )
    op.create_index('idx_repository_symbols_file', 'repository_symbols', ['file_id'])
    op.create_index('idx_repository_symbols_name', 'repository_symbols', ['name'])
    op.create_index('idx_repository_symbols_type', 'repository_symbols', ['symbol_type'])

    # repository_apis table
    op.create_table(
        'repository_apis',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('analysis_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('repository_analyses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('file_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('repository_files.id', ondelete='CASCADE'), nullable=False),
        sa.Column('method', sa.String(16), nullable=False),
        sa.Column('route', sa.Text(), nullable=False),
        sa.Column('handler', sa.String(255), nullable=False),
        sa.Column('start_line', sa.Integer(), nullable=False),
        sa.Column('end_line', sa.Integer(), nullable=False),
        sa.Column('authentication_type', sa.String(64), nullable=True),
        sa.Column('request_schema', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('response_schema', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    )
    op.create_index('idx_repository_apis_analysis', 'repository_apis', ['analysis_id'])
    op.create_index('idx_repository_apis_file', 'repository_apis', ['file_id'])


def downgrade() -> None:
    op.drop_table('repository_apis')
    op.drop_table('repository_symbols')
