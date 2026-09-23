"""dependencies and database schema tables

Revision ID: 006_deps_and_db_schema
Revises: 005_symbols_and_apis
Create Date: 2026-08-03

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '006_deps_and_db_schema'
down_revision: Union[str, None] = '005_symbols_and_apis'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. repository_dependencies table
    op.create_table(
        'repository_dependencies',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('analysis_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('repository_analyses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('version', sa.String(128), nullable=True),
        sa.Column('type', sa.String(32), nullable=False, server_default='production'),
        sa.Column('language', sa.String(64), nullable=False),
        sa.Column('file_path', sa.String(512), nullable=True),
    )
    op.create_index('idx_repo_deps_analysis', 'repository_dependencies', ['analysis_id'])
    op.create_index('idx_repo_deps_name', 'repository_dependencies', ['name'])

    # 2. repository_database_tables table
    op.create_table(
        'repository_database_tables',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('analysis_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('repository_analyses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('source_file', sa.String(512), nullable=True),
    )
    op.create_index('idx_db_tables_analysis', 'repository_database_tables', ['analysis_id'])

    # 3. repository_database_columns table
    op.create_table(
        'repository_database_columns',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('table_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('repository_database_tables.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('data_type', sa.String(128), nullable=False, server_default='string'),
        sa.Column('is_primary_key', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_nullable', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_foreign_key', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('references_table', sa.String(255), nullable=True),
        sa.Column('references_column', sa.String(255), nullable=True),
    )
    op.create_index('idx_db_columns_table', 'repository_database_columns', ['table_id'])

    # 4. repository_database_relationships table
    op.create_table(
        'repository_database_relationships',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('table_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('repository_database_tables.id', ondelete='CASCADE'), nullable=False),
        sa.Column('from_column', sa.String(255), nullable=False),
        sa.Column('to_table', sa.String(255), nullable=False),
        sa.Column('to_column', sa.String(255), nullable=False),
        sa.Column('type', sa.String(64), nullable=False, server_default='one_to_many'),
        sa.Column('is_ambiguous', sa.Boolean(), nullable=False, server_default='false'),
    )
    op.create_index('idx_db_rels_table', 'repository_database_relationships', ['table_id'])

    # 5. wikis table updates
    op.add_column('wikis', sa.Column('generation_mode', sa.String(32), server_default='llm', nullable=True))
    op.add_column('wikis', sa.Column('error_reason', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('wikis', 'error_reason')
    op.drop_column('wikis', 'generation_mode')
    op.drop_table('repository_database_relationships')
    op.drop_table('repository_database_columns')
    op.drop_table('repository_database_tables')
    op.drop_table('repository_dependencies')
