"""
KT Secure - Pydantic Schemas
"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID
from typing import Optional


# Organization Schemas
class OrganizationBase(BaseModel):
    name: str
    slug: str
    admin_email: Optional[EmailStr] = None
    parent_id: Optional[UUID] = None


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    admin_email: Optional[EmailStr] = None


class OrganizationResponse(OrganizationBase):
    id: UUID
    status: str
    hsm_slot: Optional[int] = None
    created_at: datetime
    users_count: int = 0
    keys_count: int = 0
    
    class Config:
        from_attributes = True


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str
    organization_id: Optional[UUID] = None


class UserCreate(UserBase):
    password: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None


class UserResponse(UserBase):
    id: UUID
    status: str
    azure_ad_oid: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Key Schemas
class KeyBase(BaseModel):
    name: str
    algorithm: str
    key_size: Optional[int] = None
    curve: Optional[str] = None
    hsm_slot: int


class KeyCreate(KeyBase):
    organization_id: UUID


class KeyResponse(KeyBase):
    id: UUID
    fingerprint: Optional[str] = None
    status: str
    organization_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


# Signing Config Schemas
class SigningConfigBase(BaseModel):
    name: str
    key_id: UUID
    hash_algorithm: str
    timestamp_authority: Optional[str] = None
    is_enabled: bool = True


class SigningConfigCreate(SigningConfigBase):
    organization_id: UUID


class SigningConfigResponse(SigningConfigBase):
    id: UUID
    organization_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


# Project Schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    ecu_type: Optional[str] = None


class ProjectCreate(ProjectBase):
    organization_id: UUID


class ProjectResponse(ProjectBase):
    id: UUID
    organization_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: UUID
    action: str
    user_id: Optional[UUID] = None
    entity_type: Optional[str] = None
    entity_id: Optional[UUID] = None
    changes: Optional[dict] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[UUID] = None
