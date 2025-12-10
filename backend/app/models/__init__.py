"""
KT Secure - SQLAlchemy Models
"""
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID, INET
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..database import Base


class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    status = Column(String(20), default="active")
    hsm_slot = Column(Integer, nullable=True)
    admin_email = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    # Relationships
    parent = relationship("Organization", remote_side=[id], backref="children")
    users = relationship("User", back_populates="organization")
    keys = relationship("Pkcs11Key", back_populates="organization")


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # admin, org_admin, crypto_admin, user
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    azure_ad_oid = Column(String(100), nullable=True)
    status = Column(String(20), default="active")
    hashed_password = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    organization = relationship("Organization", back_populates="users")


class Pkcs11Key(Base):
    __tablename__ = "pkcs11_keys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    algorithm = Column(String(50), nullable=False)  # RSA, ECDSA
    key_size = Column(Integer, nullable=True)  # For RSA
    curve = Column(String(50), nullable=True)  # For ECDSA
    fingerprint = Column(String(128))
    hsm_slot = Column(Integer, nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    organization = relationship("Organization", back_populates="keys")
    signing_configs = relationship("SigningConfig", back_populates="key")


class SigningConfig(Base):
    __tablename__ = "signing_configs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    key_id = Column(UUID(as_uuid=True), ForeignKey("pkcs11_keys.id"))
    hash_algorithm = Column(String(50), nullable=False)
    timestamp_authority = Column(String(255), nullable=True)
    is_enabled = Column(Boolean, default=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    key = relationship("Pkcs11Key", back_populates="signing_configs")


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    ecu_type = Column(String(100), nullable=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    action = Column(String(100), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    entity_type = Column(String(50))
    entity_id = Column(UUID(as_uuid=True))
    changes = Column(JSON)
    ip_address = Column(INET, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
