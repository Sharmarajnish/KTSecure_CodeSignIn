"""
KT Secure - Quorum Approval Models
Multi-signature (M-of-N) approval workflow for sensitive operations
"""
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from .database import Base


class ApprovalType(str, enum.Enum):
    """Types of operations requiring quorum approval."""
    KEY_GENERATION = "key_generation"
    KEY_REVOCATION = "key_revocation"
    ORGANIZATION_APPROVAL = "organization_approval"
    USER_ROLE_CHANGE = "user_role_change"
    SIGNING_CONFIG_CREATE = "signing_config_create"


class ApprovalStatus(str, enum.Enum):
    """Status of an approval request."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"


class ApprovalRequest(Base):
    """
    Represents a request for M-of-N approval.
    An operation requiring quorum approval creates this record.
    """
    __tablename__ = "approval_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Request details
    approval_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Entity being approved (e.g., key_id, organization_id)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    entity_data = Column(Text, nullable=True)  # JSON of entity details
    
    # Quorum configuration
    required_approvals = Column(Integer, default=2)  # M
    total_approvers = Column(Integer, default=3)     # N
    
    # Status tracking
    status = Column(String(20), default=ApprovalStatus.PENDING.value)
    current_approvals = Column(Integer, default=0)
    current_rejections = Column(Integer, default=0)
    
    # Metadata
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    votes = relationship("ApprovalVote", back_populates="request", cascade="all, delete-orphan")
    created_by = relationship("User", foreign_keys=[created_by_id])


class ApprovalVote(Base):
    """
    Represents a vote (approve/reject) on an approval request.
    """
    __tablename__ = "approval_votes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    request_id = Column(UUID(as_uuid=True), ForeignKey("approval_requests.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    vote = Column(String(20), nullable=False)  # 'approve' or 'reject'
    comment = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    request = relationship("ApprovalRequest", back_populates="votes")
    user = relationship("User")


class QuorumPolicy(Base):
    """
    Defines quorum policies for different operation types per organization.
    """
    __tablename__ = "quorum_policies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    approval_type = Column(String(50), nullable=False)
    
    required_approvals = Column(Integer, default=2)   # M
    total_approvers = Column(Integer, default=3)      # N
    expiry_hours = Column(Integer, default=72)        # Request expires after this many hours
    
    is_enabled = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
