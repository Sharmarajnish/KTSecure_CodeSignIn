"""
KT Secure - Signing API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from uuid import UUID
from typing import List
import hashlib
import base64

from ..database import get_db
from ..models import SigningConfig, Pkcs11Key
from ..schemas import SigningConfigCreate, SigningConfigResponse

router = APIRouter()


class SignRequest(BaseModel):
    config_id: UUID
    data: str  # Base64 encoded


class SignResponse(BaseModel):
    signature: str
    algorithm: str
    key_fingerprint: str


class VerifyRequest(BaseModel):
    signature: str
    data: str
    key_id: UUID


@router.get("/configs", response_model=List[SigningConfigResponse])
async def list_configs(
    organization_id: UUID = None,
    db: AsyncSession = Depends(get_db)
):
    """List signing configurations"""
    query = select(SigningConfig)
    if organization_id:
        query = query.where(SigningConfig.organization_id == organization_id)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/configs", response_model=SigningConfigResponse)
async def create_config(
    config: SigningConfigCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a signing configuration"""
    db_config = SigningConfig(**config.model_dump())
    db.add(db_config)
    await db.commit()
    await db.refresh(db_config)
    return db_config


@router.post("/sign", response_model=SignResponse)
async def sign_data(
    request: SignRequest,
    db: AsyncSession = Depends(get_db)
):
    """Sign data using a signing configuration"""
    result = await db.execute(
        select(SigningConfig).where(SigningConfig.id == request.config_id)
    )
    config = result.scalar_one_or_none()
    if not config:
        raise HTTPException(status_code=404, detail="Signing config not found")
    
    if not config.is_enabled:
        raise HTTPException(status_code=400, detail="Signing config is disabled")
    
    # Get the key
    key_result = await db.execute(
        select(Pkcs11Key).where(Pkcs11Key.id == config.key_id)
    )
    key = key_result.scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")
    
    # Mock signature (in production, use HSM)
    data_bytes = base64.b64decode(request.data)
    signature = hashlib.sha256(data_bytes + key.fingerprint.encode()).hexdigest()
    
    return SignResponse(
        signature=signature,
        algorithm=f"{key.algorithm}-{config.hash_algorithm}",
        key_fingerprint=key.fingerprint
    )


@router.post("/verify")
async def verify_signature(
    request: VerifyRequest,
    db: AsyncSession = Depends(get_db)
):
    """Verify a signature"""
    key_result = await db.execute(
        select(Pkcs11Key).where(Pkcs11Key.id == request.key_id)
    )
    key = key_result.scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")
    
    # Mock verification
    data_bytes = base64.b64decode(request.data)
    expected = hashlib.sha256(data_bytes + key.fingerprint.encode()).hexdigest()
    
    return {"valid": request.signature == expected}
