"""Initial schema for Users, OAuth, Repositories, Analysis, Files, Symbols, APIs

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-02

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, index=True, nullable=True),
        sa.Column('display_name', sa.String(255), nullable=True),
        sa.Column('avatar_url', sa.String(1024), nullable=True),
        sa.Column('hashed_password', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
    )

    # OAuth Accounts
    op.create_table(
        'oauth_accounts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('provider', sa.String(64), nullable=False),
        sa.Column('provider_user_id', sa.String(255), nullable=False),
        sa.Column('access_token_encrypted', sa.String(1024), nullable=False),
        sa.Column('refresh_token_encrypted', sa.String(1024), nullable=True),
        sa.Column('scopes', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
    )

    # Repositories
    op.create_table(
        'repositories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('owner_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('github_repository_id', sa.BigInteger(), nullable=False),
        sa.Column('owner', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(512), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('visibility', sa.String(32), nullable=False, server_default='public'),
        sa.Column('default_branch', sa.String(255), nullable=False, server_default='main'),
        sa.Column('github_url', sa.String(1024), nullable=False),
        sa.Column('stars', sa.Integer(), server_default='0'),
        sa.Column('forks', sa.Integer(), server_default='0'),
        sa.Column('size_bytes', sa.BigInteger(), server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('idx_repositories_full_name', 'repositories', ['full_name'])

    # Repository Analysis
    op.create_table(
        'repository_analyses',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('repository_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('repositories.id', ondelete='CASCADE'), nullable=False),
        sa.Column('branch', sa.String(255), nullable=False, server_default='main'),
        sa.Column('commit_sha', sa.String(64), nullable=True),
        sa.Column('selected_path', sa.Text(), nullable=False, server_default='/'),
        sa.Column('status', sa.String(32), nullable=False, server_default='queued'),
        sa.Column('progress', sa.SmallInteger(), server_default='0'),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('failure_reason', sa.Text(), nullable=True),
        sa.Column('parser_version', sa.String(32), server_default='1.0.0'),
        sa.Column('analysis_version', sa.String(32), server_default='1.0.0'),
    )

    # Analysis Jobs
    op.create_table(
        'analysis_jobs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('analysis_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('repository_analyses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('stage', sa.String(64), nullable=False),
        sa.Column('celery_task_id', sa.String(255), nullable=True),
        sa.Column('status', sa.String(32), nullable=False, server_default='queued'),
        sa.Column('attempt', sa.Integer(), server_default='1'),
        sa.Column('progress', sa.SmallInteger(), server_default='0'),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('error_code', sa.String(64), nullable=True),
    )

    # Repository Files
    op.create_table(
        'repository_files',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('analysis_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('repository_analyses.id', ondelete='CASCADE'), nullable=False),
        sa.Column('path', sa.Text(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('extension', sa.String(64), nullable=True),
        sa.Column('language', sa.String(64), nullable=True),
        sa.Column('size_bytes', sa.BigInteger(), server_default='0'),
        sa.Column('line_count', sa.Integer(), server_default='0'),
        sa.Column('content_hash', sa.String(64), nullable=True),
        sa.Column('is_binary', sa.Boolean(), server_default='false'),
        sa.Column('is_generated', sa.Boolean(), server_default='false'),
        sa.Column('importance_score', sa.Float(), server_default='0.0'),
        sa.UniqueConstraint('analysis_id', 'path', name='uq_analysis_file_path')
    )


def downgrade() -> None:
    op.drop_table('repository_files')
    op.drop_table('analysis_jobs')
    op.drop_table('repository_analyses')
    op.drop_table('repositories')
    op.drop_table('oauth_accounts')
    op.drop_table('users')
