"""
KT Secure - WebSocket Manager for Real-Time Notifications
"""
from fastapi import WebSocket
from typing import Dict, Set, Optional
from datetime import datetime


class ConnectionManager:
    """
    Manages WebSocket connections for real-time notifications.
    Supports broadcasting to all clients or specific users/organizations.
    """
    
    def __init__(self):
        # All active connections
        self.active_connections: Set[WebSocket] = set()
        
        # Connections by user ID
        self.user_connections: Dict[str, Set[WebSocket]] = {}
        
        # Connections by organization ID
        self.org_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(
        self, 
        websocket: WebSocket, 
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None
    ):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.add(websocket)
        
        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = set()
            self.user_connections[user_id].add(websocket)
        
        if organization_id:
            if organization_id not in self.org_connections:
                self.org_connections[organization_id] = set()
            self.org_connections[organization_id].add(websocket)
    
    def disconnect(
        self, 
        websocket: WebSocket,
        user_id: Optional[str] = None,
        organization_id: Optional[str] = None
    ):
        """Remove a WebSocket connection."""
        self.active_connections.discard(websocket)
        
        if user_id and user_id in self.user_connections:
            self.user_connections[user_id].discard(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        
        if organization_id and organization_id in self.org_connections:
            self.org_connections[organization_id].discard(websocket)
            if not self.org_connections[organization_id]:
                del self.org_connections[organization_id]
    
    async def send_personal(self, message: dict, websocket: WebSocket):
        """Send a message to a specific WebSocket."""
        try:
            await websocket.send_json(message)
        except Exception:
            self.active_connections.discard(websocket)
    
    async def send_to_user(self, message: dict, user_id: str):
        """Send a message to all connections for a specific user."""
        if user_id in self.user_connections:
            disconnected = []
            for connection in self.user_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.append(connection)
            
            for conn in disconnected:
                self.disconnect(conn, user_id=user_id)
    
    async def send_to_organization(self, message: dict, organization_id: str):
        """Send a message to all connections in an organization."""
        if organization_id in self.org_connections:
            disconnected = []
            for connection in self.org_connections[organization_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    disconnected.append(connection)
            
            for conn in disconnected:
                self.disconnect(conn, organization_id=organization_id)
    
    async def broadcast(self, message: dict):
        """Broadcast a message to all connected clients."""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                disconnected.append(connection)
        
        for conn in disconnected:
            self.active_connections.discard(conn)
    
    def get_connection_count(self) -> int:
        """Get total number of active connections."""
        return len(self.active_connections)


# Singleton instance
manager = ConnectionManager()


# Event types for notifications
class NotificationEvent:
    """Standard notification event types."""
    
    # Approval events
    APPROVAL_REQUESTED = "approval.requested"
    APPROVAL_VOTE_ADDED = "approval.vote_added"
    APPROVAL_COMPLETED = "approval.completed"
    APPROVAL_EXPIRED = "approval.expired"
    
    # Organization events
    ORG_CREATED = "organization.created"
    ORG_APPROVED = "organization.approved"
    ORG_REJECTED = "organization.rejected"
    
    # Key events
    KEY_GENERATED = "key.generated"
    KEY_REVOKED = "key.revoked"
    KEY_EXPIRING = "key.expiring"
    
    # Signing events
    SIGNING_COMPLETED = "signing.completed"
    SIGNING_FAILED = "signing.failed"
    
    # User events
    USER_INVITED = "user.invited"
    USER_ROLE_CHANGED = "user.role_changed"


def create_notification(
    event_type: str,
    title: str,
    message: str,
    entity_type: str = None,
    entity_id: str = None,
    data: dict = None
) -> dict:
    """Create a standardized notification payload."""
    return {
        "type": "notification",
        "event": event_type,
        "title": title,
        "message": message,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "data": data or {},
        "timestamp": datetime.utcnow().isoformat()
    }
