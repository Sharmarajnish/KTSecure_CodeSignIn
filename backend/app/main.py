"""
KT Secure HSM Platform - Main FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import get_settings
from .api import organizations, users, keys, signing, projects, audit, auth, quorum, websocket, ceremony, ca

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    yield
    # Shutdown
    print("👋 Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Enterprise HSM Code Signing Platform API",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(organizations.router, prefix="/api/organizations", tags=["Organizations"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(keys.router, prefix="/api/keys", tags=["Keys"])
app.include_router(signing.router, prefix="/api/signing", tags=["Signing"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit"])
app.include_router(quorum.router, prefix="/api/quorum", tags=["Quorum Approvals"])
app.include_router(websocket.router, prefix="/api/ws", tags=["WebSocket"])
app.include_router(ceremony.router, prefix="/api/ceremony", tags=["Key Ceremony"])
app.include_router(ca.router, prefix="/api/ca", tags=["Certificate Authority"])


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy"
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
