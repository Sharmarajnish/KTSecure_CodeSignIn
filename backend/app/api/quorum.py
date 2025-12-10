"""
KT Secure - Quorum Approval API
M-of-N multi-signature approval workflow endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import json

from ..database import get_db
from ..models import User
from ..models.quorum import ApprovalRequest, ApprovalVote, QuorumPolicy, ApprovalStatus
from .auth import get_current_active_user

router = APIRouter()


# Schemas
class ApprovalRequestCreate(BaseModel):
    approval_type: str
    title: str
    description: Optional[str] = None
    entity_type: str
    entity_id: UUID
    entity_data: Optional[dict] = None
    required_approvals: int = 2
    total_approvers: int = 3
    organization_id: Optional[UUID] = None


class ApprovalVoteCreate(BaseModel):
    vote: str  # 'approve' or 'reject'
    comment: Optional[str] = None


class ApprovalVoteResponse(BaseModel):
    id: UUID
    user_id: UUID
    user_name: str
    vote: str
    comment: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ApprovalRequestResponse(BaseModel):
    id: UUID
    approval_type: str
    title: str
    description: Optional[str]
    entity_type: str
    entity_id: UUID
    required_approvals: int
    total_approvers: int
    status: str
    current_approvals: int
    current_rejections: int
    created_by_id: UUID
    created_by_name: Optional[str] = None
    created_at: datetime
    expires_at: Optional[datetime]
    completed_at: Optional[datetime]
    votes: List[ApprovalVoteResponse] = []

    class Config:
        from_attributes = True


class QuorumPolicyCreate(BaseModel):
    organization_id: Optional[UUID] = None
    approval_type: str
    required_approvals: int = 2
    total_approvers: int = 3
    expiry_hours: int = 72
    is_enabled: bool = True


class QuorumPolicyResponse(BaseModel):
    id: UUID
    organization_id: Optional[UUID]
    approval_type: str
    required_approvals: int
    total_approvers: int
    expiry_hours: int
    is_enabled: bool
    created_at: datetime

    class Config:
        from_attributes = True


def require_admin(current_user: User = Depends(get_current_active_user)) -> User:
    """Require admin or super_admin role."""
    if current_user.role not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Admin role required")
    return current_user


# Approval Request Endpoints
@router.get("/requests", response_model=List[ApprovalRequestResponse])
async def list_approval_requests(
    status: Optional[str] = None,
    organization_id: Optional[UUID] = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List approval requests, optionally filtered by status or organization."""
    query = select(ApprovalRequest)
    
    if status:
        query = query.where(ApprovalRequest.status == status)
    if organization_id:
        query = query.where(ApprovalRequest.organization_id == organization_id)
    
    query = query.order_by(ApprovalRequest.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    requests = result.scalars().all()
    
    response = []
    for req in requests:
        # Get creator name
        creator_result = await db.execute(select(User).where(User.id == req.created_by_id))
        creator = creator_result.scalar_one_or_none()
        
        # Get votes with user names
        votes_result = await db.execute(
            select(ApprovalVote, User)
            .join(User, ApprovalVote.user_id == User.id)
            .where(ApprovalVote.request_id == req.id)
        )
        votes = []
        for vote, user in votes_result:
            votes.append(ApprovalVoteResponse(
                id=vote.id,
                user_id=vote.user_id,
                user_name=user.name,
                vote=vote.vote,
                comment=vote.comment,
                created_at=vote.created_at
            ))
        
        response.append(ApprovalRequestResponse(
            id=req.id,
            approval_type=req.approval_type,
            title=req.title,
            description=req.description,
            entity_type=req.entity_type,
            entity_id=req.entity_id,
            required_approvals=req.required_approvals,
            total_approvers=req.total_approvers,
            status=req.status,
            current_approvals=req.current_approvals,
            current_rejections=req.current_rejections,
            created_by_id=req.created_by_id,
            created_by_name=creator.name if creator else None,
            created_at=req.created_at,
            expires_at=req.expires_at,
            completed_at=req.completed_at,
            votes=votes
        ))
    
    return response


@router.post("/requests", response_model=ApprovalRequestResponse)
async def create_approval_request(
    data: ApprovalRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new approval request."""
    # Check for existing policy
    policy_result = await db.execute(
        select(QuorumPolicy)
        .where(QuorumPolicy.approval_type == data.approval_type)
        .where(QuorumPolicy.is_enabled.is_(True))
    )
    policy = policy_result.scalar_one_or_none()
    
    # Use policy settings or request settings
    required_approvals = policy.required_approvals if policy else data.required_approvals
    total_approvers = policy.total_approvers if policy else data.total_approvers
    expiry_hours = policy.expiry_hours if policy else 72
    
    request = ApprovalRequest(
        approval_type=data.approval_type,
        title=data.title,
        description=data.description,
        entity_type=data.entity_type,
        entity_id=data.entity_id,
        entity_data=json.dumps(data.entity_data) if data.entity_data else None,
        required_approvals=required_approvals,
        total_approvers=total_approvers,
        organization_id=data.organization_id or current_user.organization_id,
        created_by_id=current_user.id,
        expires_at=datetime.utcnow() + timedelta(hours=expiry_hours)
    )
    
    db.add(request)
    await db.commit()
    await db.refresh(request)
    
    return ApprovalRequestResponse(
        id=request.id,
        approval_type=request.approval_type,
        title=request.title,
        description=request.description,
        entity_type=request.entity_type,
        entity_id=request.entity_id,
        required_approvals=request.required_approvals,
        total_approvers=request.total_approvers,
        status=request.status,
        current_approvals=request.current_approvals,
        current_rejections=request.current_rejections,
        created_by_id=request.created_by_id,
        created_by_name=current_user.name,
        created_at=request.created_at,
        expires_at=request.expires_at,
        completed_at=request.completed_at,
        votes=[]
    )


@router.get("/requests/{request_id}", response_model=ApprovalRequestResponse)
async def get_approval_request(
    request_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific approval request with its votes."""
    result = await db.execute(
        select(ApprovalRequest).where(ApprovalRequest.id == request_id)
    )
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    # Get creator
    creator_result = await db.execute(select(User).where(User.id == request.created_by_id))
    creator = creator_result.scalar_one_or_none()
    
    # Get votes
    votes_result = await db.execute(
        select(ApprovalVote, User)
        .join(User, ApprovalVote.user_id == User.id)
        .where(ApprovalVote.request_id == request.id)
    )
    votes = []
    for vote, user in votes_result:
        votes.append(ApprovalVoteResponse(
            id=vote.id,
            user_id=vote.user_id,
            user_name=user.name,
            vote=vote.vote,
            comment=vote.comment,
            created_at=vote.created_at
        ))
    
    return ApprovalRequestResponse(
        id=request.id,
        approval_type=request.approval_type,
        title=request.title,
        description=request.description,
        entity_type=request.entity_type,
        entity_id=request.entity_id,
        required_approvals=request.required_approvals,
        total_approvers=request.total_approvers,
        status=request.status,
        current_approvals=request.current_approvals,
        current_rejections=request.current_rejections,
        created_by_id=request.created_by_id,
        created_by_name=creator.name if creator else None,
        created_at=request.created_at,
        expires_at=request.expires_at,
        completed_at=request.completed_at,
        votes=votes
    )


@router.post("/requests/{request_id}/vote", response_model=ApprovalRequestResponse)
async def vote_on_request(
    request_id: UUID,
    vote_data: ApprovalVoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Submit a vote (approve/reject) on an approval request.
    Only admins can vote. M-of-N logic is evaluated after each vote.
    """
    if vote_data.vote not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Vote must be 'approve' or 'reject'")
    
    # Get the request
    result = await db.execute(
        select(ApprovalRequest).where(ApprovalRequest.id == request_id)
    )
    request = result.scalar_one_or_none()
    
    if not request:
        raise HTTPException(status_code=404, detail="Approval request not found")
    
    if request.status != ApprovalStatus.PENDING.value:
        raise HTTPException(status_code=400, detail=f"Request is already {request.status}")
    
    # Check if expired
    if request.expires_at and datetime.utcnow() > request.expires_at:
        request.status = ApprovalStatus.EXPIRED.value
        await db.commit()
        raise HTTPException(status_code=400, detail="Request has expired")
    
    # Check if user already voted
    existing_vote = await db.execute(
        select(ApprovalVote)
        .where(ApprovalVote.request_id == request_id)
        .where(ApprovalVote.user_id == current_user.id)
    )
    if existing_vote.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="You have already voted on this request")
    
    # Creator cannot vote on their own request
    if request.created_by_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot vote on your own request")
    
    # Create the vote
    vote = ApprovalVote(
        request_id=request_id,
        user_id=current_user.id,
        vote=vote_data.vote,
        comment=vote_data.comment
    )
    db.add(vote)
    
    # Update counts
    if vote_data.vote == "approve":
        request.current_approvals += 1
    else:
        request.current_rejections += 1
    
    # Check if quorum is reached
    if request.current_approvals >= request.required_approvals:
        request.status = ApprovalStatus.APPROVED.value
        request.completed_at = datetime.utcnow()
        # TODO: Execute the approved operation (key generation, etc.)
    
    # Check if rejection threshold is reached
    remaining_voters = request.total_approvers - request.current_approvals - request.current_rejections
    if request.current_approvals + remaining_voters < request.required_approvals:
        request.status = ApprovalStatus.REJECTED.value
        request.completed_at = datetime.utcnow()
    
    await db.commit()
    
    # Return updated request
    return await get_approval_request(request_id, db)


# Quorum Policy Endpoints
@router.get("/policies", response_model=List[QuorumPolicyResponse])
async def list_quorum_policies(
    organization_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """List quorum policies."""
    query = select(QuorumPolicy)
    if organization_id:
        query = query.where(QuorumPolicy.organization_id == organization_id)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/policies", response_model=QuorumPolicyResponse)
async def create_quorum_policy(
    data: QuorumPolicyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new quorum policy."""
    if data.required_approvals > data.total_approvers:
        raise HTTPException(
            status_code=400, 
            detail="Required approvals cannot exceed total approvers"
        )
    
    policy = QuorumPolicy(
        organization_id=data.organization_id,
        approval_type=data.approval_type,
        required_approvals=data.required_approvals,
        total_approvers=data.total_approvers,
        expiry_hours=data.expiry_hours,
        is_enabled=data.is_enabled
    )
    
    db.add(policy)
    await db.commit()
    await db.refresh(policy)
    
    return policy


@router.put("/policies/{policy_id}", response_model=QuorumPolicyResponse)
async def update_quorum_policy(
    policy_id: UUID,
    data: QuorumPolicyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a quorum policy."""
    result = await db.execute(
        select(QuorumPolicy).where(QuorumPolicy.id == policy_id)
    )
    policy = result.scalar_one_or_none()
    
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    if data.required_approvals > data.total_approvers:
        raise HTTPException(
            status_code=400, 
            detail="Required approvals cannot exceed total approvers"
        )
    
    policy.approval_type = data.approval_type
    policy.required_approvals = data.required_approvals
    policy.total_approvers = data.total_approvers
    policy.expiry_hours = data.expiry_hours
    policy.is_enabled = data.is_enabled
    
    await db.commit()
    await db.refresh(policy)
    
    return policy


@router.delete("/policies/{policy_id}")
async def delete_quorum_policy(
    policy_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a quorum policy."""
    result = await db.execute(
        select(QuorumPolicy).where(QuorumPolicy.id == policy_id)
    )
    policy = result.scalar_one_or_none()
    
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    await db.delete(policy)
    await db.commit()
    
    return {"status": "deleted"}
