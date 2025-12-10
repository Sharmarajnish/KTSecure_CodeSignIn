"""
KT Secure - Keys API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List
import hashlib
import secrets

from ..database import get_db
from ..models import Pkcs11Key
from ..schemas import KeyCreate, KeyResponse

router = APIRouter()


@router.get("/", response_model=List[KeyResponse])
async def list_keys(
    organization_id: UUID = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List all keys"""
    query = select(Pkcs11Key)
    if organization_id:
        query = query.where(Pkcs11Key.organization_id == organization_id)
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/generate", response_model=KeyResponse)
async def generate_key(
    key: KeyCreate,
    db: AsyncSession = Depends(get_db)
):
    """Generate a new key in HSM"""
    # Generate mock fingerprint (in production, this comes from HSM)
    fingerprint = hashlib.sha256(secrets.token_bytes(32)).hexdigest()[:40]
    
    db_key = Pkcs11Key(
        **key.model_dump(),
        fingerprint=fingerprint
    )
    db.add(db_key)
    await db.commit()
    await db.refresh(db_key)
    return db_key


@router.get("/{key_id}", response_model=KeyResponse)
async def get_key(key_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get key by ID"""
    result = await db.execute(select(Pkcs11Key).where(Pkcs11Key.id == key_id))
    key = result.scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")
    return key


@router.delete("/{key_id}")
async def revoke_key(key_id: UUID, db: AsyncSession = Depends(get_db)):
    """Revoke a key"""
    result = await db.execute(select(Pkcs11Key).where(Pkcs11Key.id == key_id))
    key = result.scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="Key not found")
    
    key.status = "revoked"
    await db.commit()
    return {"status": "revoked"}
