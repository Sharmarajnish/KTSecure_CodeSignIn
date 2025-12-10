"""
KT Secure - Organization API Tests
"""
import pytest
from httpx import AsyncClient

from app.models import Organization


class TestOrganizationsList:
    """Tests for GET /api/organizations endpoint."""

    @pytest.mark.asyncio
    async def test_list_organizations(self, client: AsyncClient, test_organization):
        """Test listing organizations."""
        response = await client.get("/api/organizations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert any(org["slug"] == "test-org" for org in data)

    @pytest.mark.asyncio
    async def test_list_organizations_empty(self, client: AsyncClient):
        """Test listing organizations when empty."""
        response = await client.get("/api/organizations")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestOrganizationCreate:
    """Tests for POST /api/organizations endpoint."""

    @pytest.mark.asyncio
    async def test_create_organization(self, client: AsyncClient):
        """Test creating a new organization."""
        response = await client.post(
            "/api/organizations",
            json={
                "name": "New Organization",
                "slug": "new-org",
                "admin_email": "admin@neworg.com"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "New Organization"
        assert data["slug"] == "new-org"
        assert data["status"] == "active"

    @pytest.mark.asyncio
    async def test_create_organization_duplicate_slug(self, client: AsyncClient, test_organization):
        """Test creating organization with duplicate slug fails."""
        response = await client.post(
            "/api/organizations",
            json={
                "name": "Duplicate Org",
                "slug": test_organization.slug,
                "admin_email": "admin@dup.com"
            }
        )
        assert response.status_code == 400
        assert "slug" in response.json()["detail"].lower()


class TestOrganizationGet:
    """Tests for GET /api/organizations/{id} endpoint."""

    @pytest.mark.asyncio
    async def test_get_organization(self, client: AsyncClient, test_organization):
        """Test getting a specific organization."""
        response = await client.get(f"/api/organizations/{test_organization.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == test_organization.name
        assert data["slug"] == test_organization.slug

    @pytest.mark.asyncio
    async def test_get_nonexistent_organization(self, client: AsyncClient):
        """Test getting nonexistent organization fails."""
        import uuid
        fake_id = uuid.uuid4()
        response = await client.get(f"/api/organizations/{fake_id}")
        assert response.status_code == 404


class TestOrganizationApproval:
    """Tests for organization approval/rejection endpoints."""

    @pytest.mark.asyncio
    async def test_approve_organization_as_admin(
        self, client: AsyncClient, async_session, admin_auth_headers
    ):
        """Test approving a pending organization as admin."""
        # Create a pending organization
        org = Organization(
            name="Pending Org",
            slug="pending-org",
            admin_email="admin@pending.com",
            status="pending"
        )
        async_session.add(org)
        await async_session.commit()
        await async_session.refresh(org)
        
        response = await client.put(
            f"/api/organizations/{org.id}/approve",
            headers=admin_auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "active"

    @pytest.mark.asyncio
    async def test_reject_organization_as_admin(
        self, client: AsyncClient, async_session, admin_auth_headers
    ):
        """Test rejecting a pending organization as admin."""
        org = Organization(
            name="Reject Org",
            slug="reject-org",
            admin_email="admin@reject.com",
            status="pending"
        )
        async_session.add(org)
        await async_session.commit()
        await async_session.refresh(org)
        
        response = await client.put(
            f"/api/organizations/{org.id}/reject",
            headers=admin_auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "inactive"

    @pytest.mark.asyncio
    async def test_approve_without_auth_fails(self, client: AsyncClient, test_organization):
        """Test approving without authentication fails."""
        response = await client.put(f"/api/organizations/{test_organization.id}/approve")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_approve_as_regular_user_fails(
        self, client: AsyncClient, test_organization, auth_headers
    ):
        """Test approving as regular user fails."""
        response = await client.put(
            f"/api/organizations/{test_organization.id}/approve",
            headers=auth_headers
        )
        assert response.status_code == 403


class TestOrganizationUpdate:
    """Tests for PUT /api/organizations/{id} endpoint."""

    @pytest.mark.asyncio
    async def test_update_organization(self, client: AsyncClient, test_organization):
        """Test updating an organization."""
        response = await client.put(
            f"/api/organizations/{test_organization.id}",
            json={"name": "Updated Name"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"


class TestOrganizationDelete:
    """Tests for DELETE /api/organizations/{id} endpoint."""

    @pytest.mark.asyncio
    async def test_delete_organization(self, client: AsyncClient, async_session):
        """Test deleting an organization."""
        org = Organization(
            name="Delete Me",
            slug="delete-me",
            admin_email="delete@test.com",
            status="active"
        )
        async_session.add(org)
        await async_session.commit()
        await async_session.refresh(org)
        
        response = await client.delete(f"/api/organizations/{org.id}")
        assert response.status_code == 200
        
        # Verify it's deleted
        get_response = await client.get(f"/api/organizations/{org.id}")
        assert get_response.status_code == 404
