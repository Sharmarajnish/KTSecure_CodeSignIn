"""Add quorum approval tables

Revision ID: 002_quorum_tables
Revises: 001_initial
Create Date: 2024-12-10
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = '002_quorum_tables'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Quorum Policies table
    op.create_table(
        'quorum_policies',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('organization_id', sa.dialects.postgresql.UUID(as_uuid=True), 
                  sa.ForeignKey('organizations.id'), nullable=True),
        sa.Column('approval_type', sa.String(50), nullable=False),
        sa.Column('required_approvals', sa.Integer, default=2),
        sa.Column('total_approvers', sa.Integer, default=3),
        sa.Column('expiry_hours', sa.Integer, default=72),
        sa.Column('is_enabled', sa.Boolean, default=True),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, onupdate=sa.func.now())
    )
    
    # Approval Requests table
    op.create_table(
        'approval_requests',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('approval_type', sa.String(50), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('entity_type', sa.String(50), nullable=False),
        sa.Column('entity_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('entity_data', sa.Text, nullable=True),
        sa.Column('required_approvals', sa.Integer, default=2),
        sa.Column('total_approvers', sa.Integer, default=3),
        sa.Column('status', sa.String(20), default='pending'),
        sa.Column('current_approvals', sa.Integer, default=0),
        sa.Column('current_rejections', sa.Integer, default=0),
        sa.Column('organization_id', sa.dialects.postgresql.UUID(as_uuid=True), 
                  sa.ForeignKey('organizations.id'), nullable=True),
        sa.Column('created_by_id', sa.dialects.postgresql.UUID(as_uuid=True), 
                  sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
        sa.Column('expires_at', sa.DateTime, nullable=True),
        sa.Column('completed_at', sa.DateTime, nullable=True)
    )
    
    # Approval Votes table
    op.create_table(
        'approval_votes',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('request_id', sa.dialects.postgresql.UUID(as_uuid=True), 
                  sa.ForeignKey('approval_requests.id'), nullable=False),
        sa.Column('user_id', sa.dialects.postgresql.UUID(as_uuid=True), 
                  sa.ForeignKey('users.id'), nullable=False),
        sa.Column('vote', sa.String(20), nullable=False),
        sa.Column('comment', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, default=sa.func.now())
    )
    
    # Create indexes
    op.create_index('ix_approval_requests_status', 'approval_requests', ['status'])
    op.create_index('ix_approval_requests_org', 'approval_requests', ['organization_id'])
    op.create_index('ix_approval_votes_request', 'approval_votes', ['request_id'])


def downgrade() -> None:
    op.drop_index('ix_approval_votes_request')
    op.drop_index('ix_approval_requests_org')
    op.drop_index('ix_approval_requests_status')
    op.drop_table('approval_votes')
    op.drop_table('approval_requests')
    op.drop_table('quorum_policies')
