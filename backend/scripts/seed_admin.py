"""
KT Secure - Admin Seed Script

Creates the initial super admin user for the platform.

Usage:
    cd backend
    python -m scripts.seed_admin
"""
import asyncio
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.models import User, Organization
from app.core.security import get_password_hash
from app.config import get_settings


settings = get_settings()

# Default admin credentials (override via environment variables)
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@ktsecure.io")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin123!")
ADMIN_NAME = os.getenv("ADMIN_NAME", "Super Admin")


async def seed_admin():
    """Create the initial super admin user."""
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check if admin already exists
        result = await session.execute(
            select(User).where(User.email == ADMIN_EMAIL)
        )
        existing_admin = result.scalar_one_or_none()
        
        if existing_admin:
            print(f"✓ Admin user already exists: {ADMIN_EMAIL}")
            return
        
        # Create a default organization for admin (optional)
        result = await session.execute(
            select(Organization).where(Organization.slug == "ktsecure-admin")
        )
        admin_org = result.scalar_one_or_none()
        
        if not admin_org:
            admin_org = Organization(
                name="KT Secure Administration",
                slug="ktsecure-admin",
                admin_email=ADMIN_EMAIL,
                status="active"
            )
            session.add(admin_org)
            await session.commit()
            await session.refresh(admin_org)
            print(f"✓ Created admin organization: {admin_org.name}")
        
        # Create the super admin user
        hashed_password = get_password_hash(ADMIN_PASSWORD)
        admin_user = User(
            email=ADMIN_EMAIL,
            name=ADMIN_NAME,
            role="super_admin",
            hashed_password=hashed_password,
            organization_id=admin_org.id,
            status="active"
        )
        session.add(admin_user)
        await session.commit()
        
        print(f"""
╔══════════════════════════════════════════════════════════╗
║           KT Secure - Super Admin Created                 ║
╠══════════════════════════════════════════════════════════╣
║  Email:     {ADMIN_EMAIL:<42} ║
║  Password:  {ADMIN_PASSWORD:<42} ║
║  Role:      super_admin                                   ║
╠══════════════════════════════════════════════════════════╣
║  ⚠️  Please change the password after first login!        ║
╚══════════════════════════════════════════════════════════╝
        """)


if __name__ == "__main__":
    print("\n🔐 KT Secure - Admin Seed Script\n")
    asyncio.run(seed_admin())
