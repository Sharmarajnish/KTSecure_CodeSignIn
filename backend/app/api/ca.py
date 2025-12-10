"""
KT Secure - Certificate Authority Integration API
EJBCA/MSCA integration for certificate issuance
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import json

from ..database import get_db
from ..models import User, AuditLog
from .auth import get_current_active_user

router = APIRouter()


# Schemas
class CAProvider(BaseModel):
    id: str
    name: str
    type: str  # ejbca, msca, custom
    url: str
    status: str  # connected, disconnected, error
    last_check: Optional[datetime] = None


class CertificateProfile(BaseModel):
    id: str
    name: str
    key_usage: List[str]
    extended_key_usage: List[str]
    validity_days: int
    description: Optional[str] = None


class CertificateRequest(BaseModel):
    profile_id: str
    key_id: UUID
    common_name: str
    organization: str
    organization_unit: Optional[str] = None
    country: str = "US"
    state: Optional[str] = None
    locality: Optional[str] = None
    email: Optional[str] = None
    san_dns: List[str] = []
    san_ip: List[str] = []


class Certificate(BaseModel):
    id: str
    serial_number: str
    common_name: str
    issuer: str
    not_before: datetime
    not_after: datetime
    key_id: str
    fingerprint: str
    status: str  # active, revoked, expired
    created_at: datetime


# Mock data for demonstration
MOCK_CA_PROVIDERS = [
    CAProvider(
        id="ejbca-1",
        name="EJBCA Production",
        type="ejbca",
        url="https://ejbca.example.com/ejbca",
        status="connected",
        last_check=datetime.utcnow()
    ),
    CAProvider(
        id="msca-1",
        name="Microsoft CA",
        type="msca",
        url="https://ca.example.com/certsrv",
        status="connected",
        last_check=datetime.utcnow()
    )
]

MOCK_PROFILES = [
    CertificateProfile(
        id="code-signing",
        name="Code Signing Certificate",
        key_usage=["digitalSignature"],
        extended_key_usage=["codeSigning"],
        validity_days=365,
        description="For signing executables and code"
    ),
    CertificateProfile(
        id="firmware-signing",
        name="Firmware Signing Certificate",
        key_usage=["digitalSignature", "keyEncipherment"],
        extended_key_usage=["codeSigning", "timeStamping"],
        validity_days=730,
        description="For signing firmware images"
    ),
    CertificateProfile(
        id="tls-server",
        name="TLS Server Certificate",
        key_usage=["digitalSignature", "keyEncipherment"],
        extended_key_usage=["serverAuth"],
        validity_days=365,
        description="For TLS server authentication"
    ),
    CertificateProfile(
        id="document-signing",
        name="Document Signing Certificate",
        key_usage=["digitalSignature", "nonRepudiation"],
        extended_key_usage=["emailProtection", "documentSigning"],
        validity_days=365,
        description="For signing documents and PDFs"
    )
]

# In-memory certificate storage
issued_certificates: dict = {}


def require_admin(current_user: User = Depends(get_current_active_user)) -> User:
    """Require admin or super_admin role."""
    if current_user.role not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Admin role required")
    return current_user


@router.get("/providers", response_model=List[CAProvider])
async def list_ca_providers(
    current_user: User = Depends(get_current_active_user)
):
    """List configured Certificate Authority providers."""
    return MOCK_CA_PROVIDERS


@router.get("/providers/{provider_id}", response_model=CAProvider)
async def get_ca_provider(
    provider_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific CA provider."""
    for provider in MOCK_CA_PROVIDERS:
        if provider.id == provider_id:
            return provider
    raise HTTPException(status_code=404, detail="CA provider not found")


@router.post("/providers/{provider_id}/test")
async def test_ca_connection(
    provider_id: str,
    current_user: User = Depends(require_admin)
):
    """Test connection to a CA provider."""
    for provider in MOCK_CA_PROVIDERS:
        if provider.id == provider_id:
            # Simulate connection test
            return {
                "status": "success",
                "message": f"Successfully connected to {provider.name}",
                "response_time_ms": 45
            }
    raise HTTPException(status_code=404, detail="CA provider not found")


@router.get("/profiles", response_model=List[CertificateProfile])
async def list_certificate_profiles(
    current_user: User = Depends(get_current_active_user)
):
    """List available certificate profiles."""
    return MOCK_PROFILES


@router.get("/profiles/{profile_id}", response_model=CertificateProfile)
async def get_certificate_profile(
    profile_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific certificate profile."""
    for profile in MOCK_PROFILES:
        if profile.id == profile_id:
            return profile
    raise HTTPException(status_code=404, detail="Certificate profile not found")


@router.post("/certificates/request", response_model=Certificate)
async def request_certificate(
    request: CertificateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Request a new certificate from the CA.
    """
    # Verify profile exists
    profile = None
    for p in MOCK_PROFILES:
        if p.id == request.profile_id:
            profile = p
            break
    
    if not profile:
        raise HTTPException(status_code=404, detail="Certificate profile not found")
    
    # Generate mock certificate
    import hashlib
    import secrets
    
    cert_id = f"cert-{secrets.token_hex(8)}"
    serial = secrets.token_hex(16).upper()
    fingerprint = hashlib.sha256(secrets.token_bytes(32)).hexdigest()[:64]
    
    now = datetime.utcnow()
    certificate = Certificate(
        id=cert_id,
        serial_number=serial,
        common_name=request.common_name,
        issuer="CN=KT Secure CA, O=KT Secure, C=US",
        not_before=now,
        not_after=now + timedelta(days=profile.validity_days),
        key_id=str(request.key_id),
        fingerprint=fingerprint,
        status="active",
        created_at=now
    )
    
    # Store certificate
    issued_certificates[cert_id] = certificate.model_dump()
    
    # Create audit log
    audit_log = AuditLog(
        action="certificate_issued",
        entity_type="certificate",
        entity_id=None,
        entity_name=request.common_name,
        user_id=current_user.id,
        user_name=current_user.name,
        changes=json.dumps({
            "certificate_id": cert_id,
            "serial_number": serial,
            "profile": profile.name,
            "validity_days": profile.validity_days
        })
    )
    db.add(audit_log)
    await db.commit()
    
    return certificate


@router.get("/certificates", response_model=List[Certificate])
async def list_certificates(
    status: Optional[str] = None,
    key_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_active_user)
):
    """List issued certificates."""
    certs = list(issued_certificates.values())
    
    if status:
        certs = [c for c in certs if c["status"] == status]
    if key_id:
        certs = [c for c in certs if c["key_id"] == str(key_id)]
    
    return [Certificate(**c) for c in certs]


@router.get("/certificates/{cert_id}", response_model=Certificate)
async def get_certificate(
    cert_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific certificate."""
    if cert_id not in issued_certificates:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return Certificate(**issued_certificates[cert_id])


@router.post("/certificates/{cert_id}/revoke")
async def revoke_certificate(
    cert_id: str,
    reason: str = "unspecified",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Revoke a certificate."""
    if cert_id not in issued_certificates:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    cert = issued_certificates[cert_id]
    if cert["status"] == "revoked":
        raise HTTPException(status_code=400, detail="Certificate already revoked")
    
    cert["status"] = "revoked"
    
    # Create audit log
    audit_log = AuditLog(
        action="certificate_revoked",
        entity_type="certificate",
        entity_id=None,
        entity_name=cert["common_name"],
        user_id=current_user.id,
        user_name=current_user.name,
        changes=json.dumps({
            "certificate_id": cert_id,
            "reason": reason
        })
    )
    db.add(audit_log)
    await db.commit()
    
    return {"status": "revoked", "message": "Certificate has been revoked"}


@router.get("/certificates/{cert_id}/download")
async def download_certificate(
    cert_id: str,
    format: str = "pem",
    current_user: User = Depends(get_current_active_user)
):
    """
    Download certificate in specified format.
    Formats: pem, der, p7b
    """
    if cert_id not in issued_certificates:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    cert = issued_certificates[cert_id]
    
    # Generate mock PEM
    mock_pem = f"""-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJALN{cert["serial_number"][:20]}...
{cert["fingerprint"]}
-----END CERTIFICATE-----"""
    
    return {
        "format": format,
        "filename": f"{cert['common_name'].replace(' ', '_')}.{format}",
        "content": mock_pem if format == "pem" else "(binary data)"
    }
