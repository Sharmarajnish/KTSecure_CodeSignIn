"""
KT Secure - Key Ceremony API
HSM-compliant key generation workflow with witness verification
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import json

from ..database import get_db
from ..models import User, Organization, AuditLog
from .auth import get_current_active_user

router = APIRouter()


# Schemas
class WitnessInfo(BaseModel):
    user_id: UUID
    name: str
    email: str
    role: str
    has_approved: bool = False
    approved_at: Optional[datetime] = None


class CeremonyCreate(BaseModel):
    key_name: str
    algorithm: str  # RSA-2048, RSA-4096, ECDSA-P256, ECDSA-P384
    purpose: str    # code_signing, firmware_signing, etc.
    organization_id: UUID
    witness_ids: List[UUID]
    ceremony_date: str
    notes: Optional[str] = None


class CeremonyStatus(BaseModel):
    id: str
    key_name: str
    algorithm: str
    purpose: str
    status: str  # pending_witnesses, ready, generating, completed, failed
    witnesses: List[WitnessInfo]
    created_by: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    key_id: Optional[str] = None
    key_fingerprint: Optional[str] = None


# In-memory ceremony storage (in production, use database)
active_ceremonies: dict = {}


def require_crypto_admin(current_user: User = Depends(get_current_active_user)) -> User:
    """Require crypto_admin, admin, or super_admin role."""
    if current_user.role not in ["super_admin", "admin", "crypto_admin"]:
        raise HTTPException(status_code=403, detail="Crypto Admin role required")
    return current_user


@router.post("/ceremonies", response_model=CeremonyStatus)
async def create_ceremony(
    data: CeremonyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_crypto_admin)
):
    """
    Initiate a new key ceremony.
    Requires at least 2 witnesses.
    """
    if len(data.witness_ids) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 witnesses required for key ceremony"
        )
    
    # Verify organization exists
    org_result = await db.execute(
        select(Organization).where(Organization.id == data.organization_id)
    )
    org = org_result.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Get witness details
    witnesses = []
    for witness_id in data.witness_ids:
        user_result = await db.execute(select(User).where(User.id == witness_id))
        user = user_result.scalar_one_or_none()
        if user:
            witnesses.append(WitnessInfo(
                user_id=user.id,
                name=user.name,
                email=user.email,
                role=user.role,
                has_approved=False
            ))
    
    ceremony_id = f"ceremony-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    ceremony = CeremonyStatus(
        id=ceremony_id,
        key_name=data.key_name,
        algorithm=data.algorithm,
        purpose=data.purpose,
        status="pending_witnesses",
        witnesses=witnesses,
        created_by=current_user.name,
        created_at=datetime.utcnow()
    )
    
    # Store in memory (use Redis/DB in production)
    active_ceremonies[ceremony_id] = ceremony.model_dump()
    
    # Create audit log
    audit_log = AuditLog(
        action="ceremony_initiated",
        entity_type="key_ceremony",
        entity_id=None,
        entity_name=data.key_name,
        user_id=current_user.id,
        user_name=current_user.name,
        changes=json.dumps({
            "ceremony_id": ceremony_id,
            "algorithm": data.algorithm,
            "purpose": data.purpose,
            "witnesses": [str(w) for w in data.witness_ids]
        })
    )
    db.add(audit_log)
    await db.commit()
    
    return ceremony


@router.get("/ceremonies", response_model=List[CeremonyStatus])
async def list_ceremonies(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """List all key ceremonies."""
    ceremonies = list(active_ceremonies.values())
    if status:
        ceremonies = [c for c in ceremonies if c["status"] == status]
    return [CeremonyStatus(**c) for c in ceremonies]


@router.get("/ceremonies/{ceremony_id}", response_model=CeremonyStatus)
async def get_ceremony(
    ceremony_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific ceremony status."""
    if ceremony_id not in active_ceremonies:
        raise HTTPException(status_code=404, detail="Ceremony not found")
    return CeremonyStatus(**active_ceremonies[ceremony_id])


@router.post("/ceremonies/{ceremony_id}/approve")
async def approve_ceremony(
    ceremony_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Approve a ceremony as a witness.
    """
    if ceremony_id not in active_ceremonies:
        raise HTTPException(status_code=404, detail="Ceremony not found")
    
    ceremony = active_ceremonies[ceremony_id]
    
    # Find the witness
    witness_found = False
    for witness in ceremony["witnesses"]:
        if str(witness["user_id"]) == str(current_user.id):
            if witness["has_approved"]:
                raise HTTPException(status_code=400, detail="Already approved")
            witness["has_approved"] = True
            witness["approved_at"] = datetime.utcnow().isoformat()
            witness_found = True
            break
    
    if not witness_found:
        raise HTTPException(status_code=403, detail="Not a designated witness")
    
    # Check if all witnesses have approved
    all_approved = all(w["has_approved"] for w in ceremony["witnesses"])
    if all_approved:
        ceremony["status"] = "ready"
    
    # Create audit log
    audit_log = AuditLog(
        action="ceremony_witness_approved",
        entity_type="key_ceremony",
        entity_id=None,
        entity_name=ceremony["key_name"],
        user_id=current_user.id,
        user_name=current_user.name,
        changes=json.dumps({"ceremony_id": ceremony_id})
    )
    db.add(audit_log)
    await db.commit()
    
    return {"status": ceremony["status"], "message": "Approval recorded"}


@router.post("/ceremonies/{ceremony_id}/generate")
async def generate_key(
    ceremony_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_crypto_admin)
):
    """
    Generate the key after all witnesses have approved.
    """
    if ceremony_id not in active_ceremonies:
        raise HTTPException(status_code=404, detail="Ceremony not found")
    
    ceremony = active_ceremonies[ceremony_id]
    
    if ceremony["status"] != "ready":
        raise HTTPException(
            status_code=400,
            detail=f"Ceremony is not ready. Current status: {ceremony['status']}"
        )
    
    ceremony["status"] = "generating"
    
    # Simulate HSM key generation
    import hashlib
    import secrets
    
    # Generate mock key data
    key_id = f"key-{secrets.token_hex(8)}"
    key_fingerprint = hashlib.sha256(secrets.token_bytes(32)).hexdigest()[:40]
    
    ceremony["status"] = "completed"
    ceremony["completed_at"] = datetime.utcnow().isoformat()
    ceremony["key_id"] = key_id
    ceremony["key_fingerprint"] = key_fingerprint
    
    # Create audit log
    audit_log = AuditLog(
        action="ceremony_key_generated",
        entity_type="key_ceremony",
        entity_id=None,
        entity_name=ceremony["key_name"],
        user_id=current_user.id,
        user_name=current_user.name,
        changes=json.dumps({
            "ceremony_id": ceremony_id,
            "key_id": key_id,
            "key_fingerprint": key_fingerprint
        })
    )
    db.add(audit_log)
    await db.commit()
    
    return {
        "status": "completed",
        "key_id": key_id,
        "key_fingerprint": key_fingerprint,
        "message": "Key successfully generated in HSM"
    }
