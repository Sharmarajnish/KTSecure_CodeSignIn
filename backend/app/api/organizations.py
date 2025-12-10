"""
KT Secure - Organizations API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from typing import List

from ..database import get_db
from ..models import Organization, User, Pkcs11Key
from ..schemas import OrganizationCreate, OrganizationUpdate, OrganizationResponse

router = APIRouter()


@router.get("/", response_model=List[OrganizationResponse])
async def list_organizations(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List all organizations with user and key counts"""
    result = await db.execute(
        select(Organization).offset(skip).limit(limit)
    )
    orgs = result.scalars().all()
    
    response = []
    for org in orgs:
        # Get counts
        users_count = await db.scalar(
            select(func.count(User.id)).where(User.organization_id == org.id)
        )
        keys_count = await db.scalar(
            select(func.count(Pkcs11Key.id)).where(Pkcs11Key.organization_id == org.id)
        )
        
        response.append(OrganizationResponse(
            id=org.id,
            name=org.name,
            slug=org.slug,
            admin_email=org.admin_email,
            parent_id=org.parent_id,
            status=org.status,
            hsm_slot=org.hsm_slot,
            created_at=org.created_at,
            users_count=users_count or 0,
            keys_count=keys_count or 0
        ))
    
    return response


@router.post("/", response_model=OrganizationResponse)
async def create_organization(
    org: OrganizationCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new organization"""
    # Check slug uniqueness
    existing = await db.scalar(
        select(Organization).where(Organization.slug == org.slug)
    )
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    db_org = Organization(**org.model_dump())
    db.add(db_org)
    await db.commit()
    await db.refresh(db_org)
    
    return OrganizationResponse(
        id=db_org.id,
        name=db_org.name,
        slug=db_org.slug,
        admin_email=db_org.admin_email,
        parent_id=db_org.parent_id,
        status=db_org.status,
        hsm_slot=db_org.hsm_slot,
        created_at=db_org.created_at,
        users_count=0,
        keys_count=0
    )


@router.get("/{org_id}", response_model=OrganizationResponse)
async def get_organization(
    org_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get organization by ID"""
    result = await db.execute(
        select(Organization).where(Organization.id == org_id)
    )
    org = result.scalar_one_or_none()
    
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    users_count = await db.scalar(
        select(func.count(User.id)).where(User.organization_id == org.id)
    )
    keys_count = await db.scalar(
        select(func.count(Pkcs11Key.id)).where(Pkcs11Key.organization_id == org.id)
    )
    
    return OrganizationResponse(
        id=org.id,
        name=org.name,
        slug=org.slug,
        admin_email=org.admin_email,
        parent_id=org.parent_id,
        status=org.status,
        hsm_slot=org.hsm_slot,
        created_at=org.created_at,
        users_count=users_count or 0,
        keys_count=keys_count or 0
    )


@router.put("/{org_id}", response_model=OrganizationResponse)
async def update_organization(
    org_id: UUID,
    org_update: OrganizationUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an organization"""
    result = await db.execute(
        select(Organization).where(Organization.id == org_id)
    )
    org = result.scalar_one_or_none()
    
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    for field, value in org_update.model_dump(exclude_unset=True).items():
        setattr(org, field, value)
    
    await db.commit()
    await db.refresh(org)
    
    return await get_organization(org_id, db)


@router.delete("/{org_id}")
async def delete_organization(
    org_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Delete an organization"""
    result = await db.execute(
        select(Organization).where(Organization.id == org_id)
    )
    org = result.scalar_one_or_none()
    
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    await db.delete(org)
    await db.commit()
    
    return {"status": "deleted"}


@router.put("/{org_id}/approve", response_model=OrganizationResponse)
async def approve_organization(
    org_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Approve a pending organization.
    Only super_admin and admin roles can approve organizations.
    """
    # TODO: Add role check when auth is integrated
    # if current_user.role not in ["super_admin", "admin"]:
    #     raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.execute(
        select(Organization).where(Organization.id == org_id)
    )
    org = result.scalar_one_or_none()
    
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    if org.status == "active":
        raise HTTPException(status_code=400, detail="Organization is already active")
    
    org.status = "active"
    await db.commit()
    await db.refresh(org)
    
    # Get counts for response
    users_count = await db.scalar(
        select(func.count(User.id)).where(User.organization_id == org.id)
    )
    keys_count = await db.scalar(
        select(func.count(Pkcs11Key.id)).where(Pkcs11Key.organization_id == org.id)
    )
    
    return OrganizationResponse(
        id=org.id,
        name=org.name,
        slug=org.slug,
        admin_email=org.admin_email,
        parent_id=org.parent_id,
        status=org.status,
        hsm_slot=org.hsm_slot,
        created_at=org.created_at,
        users_count=users_count or 0,
        keys_count=keys_count or 0
    )


@router.put("/{org_id}/reject", response_model=OrganizationResponse)
async def reject_organization(
    org_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Reject a pending organization.
    Only super_admin and admin roles can reject organizations.
    """
    # TODO: Add role check when auth is integrated
    # if current_user.role not in ["super_admin", "admin"]:
    #     raise HTTPException(status_code=403, detail="Not authorized")
    
    result = await db.execute(
        select(Organization).where(Organization.id == org_id)
    )
    org = result.scalar_one_or_none()
    
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    org.status = "inactive"
    await db.commit()
    await db.refresh(org)
    
    # Get counts for response
    users_count = await db.scalar(
        select(func.count(User.id)).where(User.organization_id == org.id)
    )
    keys_count = await db.scalar(
        select(func.count(Pkcs11Key.id)).where(Pkcs11Key.organization_id == org.id)
    )
    
    return OrganizationResponse(
        id=org.id,
        name=org.name,
        slug=org.slug,
        admin_email=org.admin_email,
        parent_id=org.parent_id,
        status=org.status,
        hsm_slot=org.hsm_slot,
        created_at=org.created_at,
        users_count=users_count or 0,
        keys_count=keys_count or 0
    )

