# KT Secure - Code Signing Platform

A comprehensive HSM-based code signing platform with enterprise features.

## Features

- 🔐 **HSM Integration** - PKCS#11 key management with hardware security modules
- 🏢 **Multi-tenant Organizations** - Hierarchical organization structure with approval workflow
- 👥 **Role-Based Access Control** - Super Admin, Admin, Org Admin, Crypto Admin, User roles
- 🔑 **Key Management** - RSA and ECDSA key generation and lifecycle management
- ✍️ **Signing Configurations** - Flexible signing profiles with timestamp authorities
- 📊 **Dashboard Analytics** - Real-time metrics and activity monitoring
- 📜 **Audit Logging** - Comprehensive audit trail for compliance
- 🤖 **AI Assistant** - Gemini-powered chatbot for help and documentation

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis (optional, for caching)

## Installation

### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
alembic upgrade head

# Seed the admin user
python -m scripts.seed_admin

# Start the server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Default Admin Credentials

After running the seed script:

- **Email**: admin@ktsecure.io
- **Password**: Admin123!

> ⚠️ **Important**: Change the password after first login!

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/          # API routers
│   │   ├── core/         # Security, exceptions
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   └── services/     # Business logic
│   ├── alembic/          # Database migrations
│   ├── scripts/          # Admin scripts
│   └── tests/            # Test suite
│
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API clients
│   │   └── types/        # TypeScript types
│   └── public/           # Static assets
│
└── docker-compose.yml    # Docker setup
```

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/ktsecure
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-change-in-production
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api
```

## License

Proprietary - KT Secure © 2024
