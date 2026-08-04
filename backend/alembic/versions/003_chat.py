"""Chat migration

Revision ID: 003_chat
Revises: 002_code_chunks_embeddings
Create Date: 2026-08-02 17:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = '003_chat'
down_revision = '002_code_chunks_embeddings'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        'chat_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('repository_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('repositories.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('title', sa.String(length=512), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('idx_chat_sessions_repo', 'chat_sessions', ['repository_id', sa.text('created_at DESC')])

    op.create_table(
        'chat_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('chat_sessions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.String(length=32), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('idx_chat_messages_session', 'chat_messages', ['session_id', 'created_at'])

    op.create_table(
        'chat_citations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('message_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('chat_messages.id', ondelete='CASCADE'), nullable=False),
        sa.Column('chunk_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('code_chunks.id', ondelete='SET NULL'), nullable=True),
        sa.Column('path', sa.String(length=2048), nullable=False),
        sa.Column('start_line', sa.Integer(), nullable=True),
        sa.Column('end_line', sa.Integer(), nullable=True),
        sa.Column('validated', sa.Boolean(), server_default='true', nullable=False),
    )

def downgrade() -> None:
    op.drop_table('chat_citations')
    op.drop_index('idx_chat_messages_session', table_name='chat_messages')
    op.drop_table('chat_messages')
    op.drop_index('idx_chat_sessions_repo', table_name='chat_sessions')
    op.drop_table('chat_sessions')
