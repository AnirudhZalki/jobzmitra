"""add missing user profile columns

Revision ID: f3a1c2d4e5b6
Revises: d1b1aab5e490
Create Date: 2026-06-28 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'f3a1c2d4e5b6'
down_revision: Union[str, Sequence[str], None] = 'b56dd89aaa20'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    existing = [col['name'] for col in inspector.get_columns('users')]

    if 'avatar_url' not in existing:
        op.add_column('users', sa.Column('avatar_url', sa.String(), nullable=True))
    if 'bio' not in existing:
        op.add_column('users', sa.Column('bio', sa.String(), nullable=True))
    if 'skills' not in existing:
        op.add_column('users', sa.Column('skills', sa.String(), nullable=True))
    if 'resume_url' not in existing:
        op.add_column('users', sa.Column('resume_url', sa.String(), nullable=True))
    if 'location' not in existing:
        op.add_column('users', sa.Column('location', sa.String(), nullable=True))
    if 'portfolio_url' not in existing:
        op.add_column('users', sa.Column('portfolio_url', sa.String(), nullable=True))
    if 'is_premium' not in existing:
        op.add_column('users', sa.Column('is_premium', sa.Boolean(), nullable=True, server_default='false'))
    if 'premium_expires_at' not in existing:
        op.add_column('users', sa.Column('premium_expires_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'premium_expires_at')
    op.drop_column('users', 'is_premium')
    op.drop_column('users', 'portfolio_url')
    op.drop_column('users', 'location')
    op.drop_column('users', 'resume_url')
    op.drop_column('users', 'skills')
    op.drop_column('users', 'bio')
    op.drop_column('users', 'avatar_url')
