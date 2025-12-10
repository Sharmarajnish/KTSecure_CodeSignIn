# Backend Tests

This directory contains unit and integration tests for the KT Secure backend API.

## Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_auth.py

# Verbose output
pytest -v
```

## Test Structure

- `conftest.py` - Shared fixtures and test configuration
- `test_auth.py` - Authentication endpoint tests
- `test_organizations.py` - Organization CRUD and approval tests
- `test_users.py` - User management tests
- `test_keys.py` - Key generation and management tests
