# KT Secure - API & Authorization Reference

## User Roles & Permissions

### Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                        SUPER_ADMIN                               │
│  • Full system access across all organizations                   │
│  • Can approve/reject organizations                              │
│  • Can manage all users, keys, and policies                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                          ADMIN                                   │
│  • Organization-level administrator                              │
│  • Can approve/reject pending organizations                      │
│  • Can vote on quorum approval requests                          │
│  • Can manage users within their organization                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                        OPERATOR                                  │
│  • Can perform signing operations                                │
│  • Can view keys and configurations                              │
│  • Cannot create/delete keys or configs                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                         VIEWER                                   │
│  • Read-only access                                              │
│  • Can view dashboard, audit logs                                │
│  • Cannot perform any write operations                           │
└─────────────────────────────────────────────────────────────────┘
```

### Permission Matrix

| Action | super_admin | admin | operator | viewer |
|--------|:-----------:|:-----:|:--------:|:------:|
| **Organizations** |
| View all orgs | ✅ | ✅ | ✅ | ✅ |
| Create org | ✅ | ❌ | ❌ | ❌ |
| Approve/Reject org | ✅ | ✅ | ❌ | ❌ |
| Delete org | ✅ | ❌ | ❌ | ❌ |
| **Users** |
| View users | ✅ | ✅ | ✅ | ✅ |
| Invite user | ✅ | ✅ | ❌ | ❌ |
| Change user role | ✅ | ✅ | ❌ | ❌ |
| Deactivate user | ✅ | ✅ | ❌ | ❌ |
| **Keys** |
| View keys | ✅ | ✅ | ✅ | ✅ |
| Generate key | ✅ | ✅ | ❌ | ❌ |
| Revoke key | ✅ | ✅ | ❌ | ❌ |
| **Signing** |
| View configs | ✅ | ✅ | ✅ | ✅ |
| Create config | ✅ | ✅ | ❌ | ❌ |
| Perform signing | ✅ | ✅ | ✅ | ❌ |
| **Quorum Approvals** |
| View requests | ✅ | ✅ | ✅ | ✅ |
| Create request | ✅ | ✅ | ❌ | ❌ |
| Vote on request | ✅ | ✅ | ❌ | ❌ |
| Manage policies | ✅ | ❌ | ❌ | ❌ |

---

## Admin Workflow

### 1. Organization Approval Flow

```
┌───────────┐     ┌───────────┐     ┌───────────┐
│  User     │────▶│  Pending  │────▶│  admin/   │
│  Creates  │     │  Status   │     │super_admin│
│  Org      │     │           │     │  Reviews  │
└───────────┘     └───────────┘     └─────┬─────┘
                                          │
                     ┌────────────────────┼────────────────────┐
                     │                    │                    │
                     ▼                    ▼                    ▼
              ┌───────────┐        ┌───────────┐        ┌───────────┐
              │  APPROVE  │        │  REJECT   │        │  Pending  │
              │  ──────▶  │        │  ──────▶  │        │  (wait)   │
              │  active   │        │  inactive │        │           │
              └───────────┘        └───────────┘        └───────────┘
```

### 2. M-of-N Quorum Approval Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. User Creates Approval Request                                │
│     POST /api/quorum/requests                                    │
│     • title: "Generate Production RSA Key"                       │
│     • approval_type: "key_generation"                            │
│     • entity_id: <key_id>                                        │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. Request enters PENDING status                                │
│     • Required approvals: M (e.g., 2)                            │
│     • Total approvers: N (e.g., 3)                               │
│     • Expires in: 72 hours                                       │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Admins Vote                                                  │
│     POST /api/quorum/requests/{id}/vote                         │
│     • vote: "approve" or "reject"                                │
│     • Creator CANNOT vote on their own request                   │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌──────────────────┬─────────────────────┬────────────────────────┐
│  If M approvals  │  If cannot reach M  │  If time > expires_at  │
│        ▼         │         ▼           │          ▼             │
│    APPROVED      │     REJECTED        │      EXPIRED           │
└──────────────────┴─────────────────────┴────────────────────────┘
```

---

## API Reference (Real Backend Endpoints)

### Base URL
```
http://localhost:8000/api
```

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login (returns JWT) | ❌ |
| GET | `/auth/me` | Get current user | ✅ |
| POST | `/auth/refresh` | Refresh token | ✅ |

### Organizations ✅ REAL

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/organizations` | List all | ❌ |
| POST | `/organizations` | Create new | ✅ |
| GET | `/organizations/{id}` | Get by ID | ❌ |
| PUT | `/organizations/{id}` | Update | ✅ |
| DELETE | `/organizations/{id}` | Delete | ✅ admin |
| PUT | `/organizations/{id}/approve` | Approve | ✅ admin |
| PUT | `/organizations/{id}/reject` | Reject | ✅ admin |

### Users ✅ REAL

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/users` | List all | ✅ |
| GET | `/users/{id}` | Get by ID | ✅ |
| POST | `/users/invite` | Invite user | ✅ admin |
| PUT | `/users/{id}` | Update user | ✅ admin |

### Keys ✅ REAL

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/keys` | List all | ✅ |
| GET | `/keys/{id}` | Get by ID | ✅ |
| POST | `/keys/generate` | Generate key | ✅ admin |
| DELETE | `/keys/{id}` | Revoke key | ✅ admin |

### Signing ✅ REAL

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/signing/configs` | List configs | ✅ |
| POST | `/signing/configs` | Create config | ✅ admin |
| POST | `/signing/sign` | Sign data | ✅ operator |
| POST | `/signing/verify` | Verify signature | ✅ |

### Projects ✅ REAL

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/projects` | List all | ✅ |
| GET | `/projects/{id}` | Get by ID | ✅ |
| POST | `/projects` | Create project | ✅ |

### Audit Logs ✅ REAL

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/audit` | List logs | ✅ |

### Quorum Approvals ✅ REAL

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| GET | `/quorum/requests` | List requests | ✅ |
| POST | `/quorum/requests` | Create request | ✅ |
| GET | `/quorum/requests/{id}` | Get request | ✅ |
| POST | `/quorum/requests/{id}/vote` | Vote | ✅ admin |
| GET | `/quorum/policies` | List policies | ✅ admin |
| POST | `/quorum/policies` | Create policy | ✅ admin |
| PUT | `/quorum/policies/{id}` | Update policy | ✅ admin |
| DELETE | `/quorum/policies/{id}` | Delete policy | ✅ admin |

### WebSocket ✅ REAL

| Type | Endpoint | Description |
|------|----------|-------------|
| WS | `/ws/events` | Real-time notifications |
| GET | `/ws/status` | Connection stats |

---

## Swagger Documentation

When backend is running:
```
http://localhost:8000/docs     # Swagger UI
http://localhost:8000/redoc    # ReDoc
```
