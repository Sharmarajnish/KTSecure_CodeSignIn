"""Initial migration - Create all tables

Revision ID: 001_initial
Revises: 
Create Date: 2024-12-10

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Organizations table
    op.create_table('organizations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(100), unique=True, nullable=False),
        sa.Column('parent_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('organizations.id'), nullable=True),
        sa.Column('status', sa.String(20), server_default='active'),
        sa.Column('hsm_slot', sa.Integer, nullable=True),
        sa.Column('admin_email', sa.String(255)),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, onupdate=sa.func.now()),
    )

    # Users table
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('organizations.id')),
        sa.Column('azure_ad_oid', sa.String(100), nullable=True),
        sa.Column('status', sa.String(20), server_default='active'),
        sa.Column('hashed_password', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )

    # PKCS#11 Keys table
    op.create_table('pkcs11_keys',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('algorithm', sa.String(50), nullable=False),
        sa.Column('key_size', sa.Integer, nullable=True),
        sa.Column('curve', sa.String(50), nullable=True),
        sa.Column('fingerprint', sa.String(128)),
        sa.Column('hsm_slot', sa.Integer, nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('organizations.id')),
        sa.Column('status', sa.String(20), server_default='active'),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )

    # Signing Configs table
    op.create_table('signing_configs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('key_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('pkcs11_keys.id')),
        sa.Column('hash_algorithm', sa.String(50), nullable=False),
        sa.Column('timestamp_authority', sa.String(255), nullable=True),
        sa.Column('is_enabled', sa.Boolean, server_default='true'),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('organizations.id')),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )

    # Projects table
    op.create_table('projects',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('ecu_type', sa.String(100), nullable=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('organizations.id')),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )

    # Audit Logs table
    op.create_table('audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('entity_type', sa.String(50)),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True)),
        sa.Column('changes', postgresql.JSON),
        sa.Column('ip_address', postgresql.INET, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('projects')
    op.drop_table('signing_configs')
    op.drop_table('pkcs11_keys')
    op.drop_table('users')
    op.drop_table('organizations')
