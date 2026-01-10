"""add otps table

Revision ID: 2f9f26c1d3cf
Revises: 1f9f26c1d3ce
Create Date: 2026-01-09 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2f9f26c1d3cf'
down_revision: Union[str, Sequence[str], None] = '1f9f26c1d3ce'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('otps',
        sa.Column('id', sa.BigInteger(), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('token', sa.String(length=6), nullable=False),
        sa.Column('transaction_id', sa.BigInteger(), nullable=True),
        sa.Column('status', sa.Enum('PENDING', 'USED', 'EXPIRED', name='otpstatus'), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('used_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['transaction_id'], ['transactions.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_otps_user_id'), 'otps', ['user_id'], unique=False)
    op.create_index(op.f('ix_otps_transaction_id'), 'otps', ['transaction_id'], unique=False)
    op.create_index('ix_otp_user_status', 'otps', ['user_id', 'status'], unique=False)
    op.create_index('ix_otp_user_pending', 'otps', ['user_id', 'status', 'expires_at'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_otp_user_pending', table_name='otps')
    op.drop_index('ix_otp_user_status', table_name='otps')
    op.drop_index(op.f('ix_otps_transaction_id'), table_name='otps')
    op.drop_index(op.f('ix_otps_user_id'), table_name='otps')
    op.drop_table('otps')
    op.execute("DROP TYPE IF EXISTS otpstatus")
