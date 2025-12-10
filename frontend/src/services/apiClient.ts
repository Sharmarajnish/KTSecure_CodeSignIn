/**
 * KT Secure - API Client
 * Direct HTTP client for backend API
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiRequestOptions extends RequestInit {
    headers?: Record<string, string>;
}

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function apiRequest<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || 'Request failed');
    }

    return response.json();
}

// Response types
interface OrganizationResponse {
    id: string;
    name: string;
    slug: string;
    admin_email?: string;
    parent_id?: string;
    status?: string;
    hsm_slot?: number;
    created_at?: string;
    users_count?: number;
    keys_count?: number;
}

interface UserResponse {
    id: string;
    email: string;
    name: string;
    role: string;
    organization_id?: string;
    status?: string;
}

interface KeyResponse {
    id: string;
    name: string;
    algorithm: string;
    key_size?: number;
    curve?: string;
    fingerprint?: string;
    hsm_slot?: number;
    organization_id?: string;
    status?: string;
}

interface SigningConfigResponse {
    id: string;
    name: string;
    key_id?: string;
    hash_algorithm?: string;
    timestamp_authority?: string;
    is_enabled?: boolean;
    organization_id?: string;
}

interface ProjectResponse {
    id: string;
    name: string;
    description?: string;
    ecu_type?: string;
    organization_id?: string;
}

interface AuditLogResponse {
    id: string;
    action: string;
    user_id?: string;
    entity_type?: string;
    entity_id?: string;
    changes?: Record<string, unknown>;
    created_at?: string;
}

interface TokenResponse {
    access_token: string;
    token_type: string;
}

interface CreateRequest {
    name?: string;
    slug?: string;
    admin_email?: string;
    email?: string;
    role?: string;
    organization_id?: string;
    algorithm?: string;
    key_id?: string;
    hash_algorithm?: string;
    timestamp_authority?: string;
    description?: string;
    ecu_type?: string;
}

export const apiClient = {
    // Organizations
    organizations: {
        list: () => apiRequest<OrganizationResponse[]>('/api/organizations'),
        get: (id: string) => apiRequest<OrganizationResponse>(`/api/organizations/${id}`),
        create: (data: CreateRequest) => apiRequest<OrganizationResponse>('/api/organizations', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id: string, data: CreateRequest) => apiRequest<OrganizationResponse>(`/api/organizations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id: string) => apiRequest<void>(`/api/organizations/${id}`, {
            method: 'DELETE'
        })
    },

    // Users
    users: {
        list: (orgId?: string) => apiRequest<UserResponse[]>(
            orgId ? `/api/users?organization_id=${orgId}` : '/api/users'
        ),
        get: (id: string) => apiRequest<UserResponse>(`/api/users/${id}`),
        invite: (data: CreateRequest) => apiRequest<UserResponse>('/api/users/invite', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id: string, data: CreateRequest) => apiRequest<UserResponse>(`/api/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        })
    },

    // Keys
    keys: {
        list: (orgId?: string) => apiRequest<KeyResponse[]>(
            orgId ? `/api/keys?organization_id=${orgId}` : '/api/keys'
        ),
        get: (id: string) => apiRequest<KeyResponse>(`/api/keys/${id}`),
        generate: (data: CreateRequest) => apiRequest<KeyResponse>('/api/keys/generate', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        revoke: (id: string) => apiRequest<void>(`/api/keys/${id}`, {
            method: 'DELETE'
        })
    },

    // Signing
    signing: {
        configs: (orgId?: string) => apiRequest<SigningConfigResponse[]>(
            orgId ? `/api/signing/configs?organization_id=${orgId}` : '/api/signing/configs'
        ),
        createConfig: (data: CreateRequest) => apiRequest<SigningConfigResponse>('/api/signing/configs', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        sign: (data: { config_id: string; data: string }) => apiRequest<{ signature: string }>('/api/signing/sign', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        verify: (data: { signature: string; data: string; key_id: string }) =>
            apiRequest<{ valid: boolean }>('/api/signing/verify', {
                method: 'POST',
                body: JSON.stringify(data)
            })
    },

    // Projects
    projects: {
        list: (orgId?: string) => apiRequest<ProjectResponse[]>(
            orgId ? `/api/projects?organization_id=${orgId}` : '/api/projects'
        ),
        get: (id: string) => apiRequest<ProjectResponse>(`/api/projects/${id}`),
        create: (data: CreateRequest) => apiRequest<ProjectResponse>('/api/projects', {
            method: 'POST',
            body: JSON.stringify(data)
        })
    },

    // Audit
    audit: {
        list: (params?: { user_id?: string; entity_type?: string }) => {
            const query = new URLSearchParams(params || {}).toString();
            return apiRequest<AuditLogResponse[]>(`/api/audit${query ? `?${query}` : ''}`);
        }
    },

    // Auth
    auth: {
        me: () => apiRequest<UserResponse>('/api/auth/me'),
        refresh: () => apiRequest<TokenResponse>('/api/auth/refresh', { method: 'POST' })
    }
};
