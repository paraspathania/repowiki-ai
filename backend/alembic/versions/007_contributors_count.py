"""Add contributors_count to repositories

Revision ID: 007_contributors_count
Revises: 006_deps_and_db_schema
Create Date: 2026-09-23

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "007_contributors_count"
down_revision: Union[str, None] = "006_deps_and_db_schema"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "repositories",
        sa.Column("contributors_count", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("repositories", "contributors_count")
