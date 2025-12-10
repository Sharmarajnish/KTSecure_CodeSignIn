"""
KT Secure - WebSocket API Endpoints
Real-time notification system
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
import json

from ..core.websocket import manager, create_notification, NotificationEvent

router = APIRouter()


@router.websocket("/events")
async def websocket_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    organization_id: Optional[str] = Query(None)
):
    """
    WebSocket endpoint for real-time event notifications.
    
    Connect with optional query parameters:
    - token: JWT token for authentication (optional for public events)
    - user_id: Filter events for specific user
    - organization_id: Filter events for specific organization
    
    Example: ws://localhost:8000/api/ws/events?user_id=xxx&organization_id=yyy
    """
    await manager.connect(
        websocket,
        user_id=user_id,
        organization_id=organization_id
    )
    
    # Send welcome message
    await manager.send_personal({
        "type": "connected",
        "message": "Connected to KT Secure real-time events",
        "connection_id": id(websocket)
    }, websocket)
    
    try:
        while True:
            # Listen for client messages (ping/pong, subscriptions, etc.)
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                
                # Handle ping
                if message.get("type") == "ping":
                    await manager.send_personal({
                        "type": "pong",
                        "timestamp": message.get("timestamp")
                    }, websocket)
                
                # Handle subscription changes
                elif message.get("type") == "subscribe":
                    # Client wants to subscribe to additional channels
                    new_org = message.get("organization_id")
                    if new_org:
                        if new_org not in manager.org_connections:
                            manager.org_connections[new_org] = set()
                        manager.org_connections[new_org].add(websocket)
                        await manager.send_personal({
                            "type": "subscribed",
                            "channel": f"organization:{new_org}"
                        }, websocket)
                
            except json.JSONDecodeError:
                # Not JSON, ignore or echo back
                pass
                
    except WebSocketDisconnect:
        manager.disconnect(
            websocket,
            user_id=user_id,
            organization_id=organization_id
        )


@router.get("/status")
async def websocket_status():
    """Get WebSocket server status."""
    return {
        "active_connections": manager.get_connection_count(),
        "user_channels": len(manager.user_connections),
        "org_channels": len(manager.org_connections)
    }


# Utility functions to send notifications from other parts of the app
async def notify_approval_requested(
    request_id: str,
    title: str,
    organization_id: str = None
):
    """Send notification when a new approval request is created."""
    notification = create_notification(
        event_type=NotificationEvent.APPROVAL_REQUESTED,
        title="New Approval Request",
        message=f"Request: {title}",
        entity_type="approval_request",
        entity_id=request_id
    )
    
    if organization_id:
        await manager.send_to_organization(notification, organization_id)
    else:
        await manager.broadcast(notification)


async def notify_approval_vote(
    request_id: str,
    voter_name: str,
    vote: str,
    current_approvals: int,
    required_approvals: int,
    organization_id: str = None
):
    """Send notification when someone votes on an approval request."""
    notification = create_notification(
        event_type=NotificationEvent.APPROVAL_VOTE_ADDED,
        title="Vote Recorded",
        message=f"{voter_name} voted to {vote}. {current_approvals}/{required_approvals} approvals.",
        entity_type="approval_request",
        entity_id=request_id,
        data={
            "vote": vote,
            "current_approvals": current_approvals,
            "required_approvals": required_approvals
        }
    )
    
    if organization_id:
        await manager.send_to_organization(notification, organization_id)
    else:
        await manager.broadcast(notification)


async def notify_approval_completed(
    request_id: str,
    title: str,
    status: str,
    organization_id: str = None
):
    """Send notification when an approval request is completed."""
    notification = create_notification(
        event_type=NotificationEvent.APPROVAL_COMPLETED,
        title=f"Request {status.title()}",
        message=f"'{title}' has been {status}",
        entity_type="approval_request",
        entity_id=request_id,
        data={"status": status}
    )
    
    if organization_id:
        await manager.send_to_organization(notification, organization_id)
    else:
        await manager.broadcast(notification)


async def notify_organization_status(
    org_id: str,
    org_name: str,
    status: str
):
    """Send notification for organization status changes."""
    event_type = (
        NotificationEvent.ORG_APPROVED if status == "active" 
        else NotificationEvent.ORG_REJECTED
    )
    
    notification = create_notification(
        event_type=event_type,
        title=f"Organization {status.title()}",
        message=f"Organization '{org_name}' has been {status}",
        entity_type="organization",
        entity_id=org_id,
        data={"status": status}
    )
    
    await manager.broadcast(notification)


async def notify_key_event(
    key_id: str,
    key_name: str,
    event: str,
    organization_id: str = None
):
    """Send notification for key events (generated, revoked, expiring)."""
    event_types = {
        "generated": NotificationEvent.KEY_GENERATED,
        "revoked": NotificationEvent.KEY_REVOKED,
        "expiring": NotificationEvent.KEY_EXPIRING
    }
    
    notification = create_notification(
        event_type=event_types.get(event, "key.event"),
        title=f"Key {event.title()}",
        message=f"Key '{key_name}' has been {event}",
        entity_type="key",
        entity_id=key_id
    )
    
    if organization_id:
        await manager.send_to_organization(notification, organization_id)
    else:
        await manager.broadcast(notification)
