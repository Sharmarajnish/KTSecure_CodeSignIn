/**
 * KT Secure - API Client
 * Replaces mock API with real backend calls when available
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
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

export const apiClient = {
    // Organizations
    organizations: {
        list: () => apiRequest<any[]>('/api/organizations'),
        get: (id: string) => apiRequest<any>(`/api/organizations/${id}`),
        create: (data: any) => apiRequest<any>('/api/organizations', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id: string, data: any) => apiRequest<any>(`/api/organizations/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
        delete: (id: string) => apiRequest<void>(`/api/organizations/${id}`, {
            method: 'DELETE'
        })
    },

    // Users
    users: {
        list: (orgId?: string) => apiRequest<any[]>(
            orgId ? `/api/users?organization_id=${orgId}` : '/api/users'
        ),
        get: (id: string) => apiRequest<any>(`/api/users/${id}`),
        invite: (data: any) => apiRequest<any>('/api/users/invite', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        update: (id: string, data: any) => apiRequest<any>(`/api/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        })
    },

    // Keys
    keys: {
        list: (orgId?: string) => apiRequest<any[]>(
            orgId ? `/api/keys?organization_id=${orgId}` : '/api/keys'
        ),
        get: (id: string) => apiRequest<any>(`/api/keys/${id}`),
        generate: (data: any) => apiRequest<any>('/api/keys/generate', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        revoke: (id: string) => apiRequest<void>(`/api/keys/${id}`, {
            method: 'DELETE'
        })
    },

    // Signing
    signing: {
        configs: (orgId?: string) => apiRequest<any[]>(
            orgId ? `/api/signing/configs?organization_id=${orgId}` : '/api/signing/configs'
        ),
        createConfig: (data: any) => apiRequest<any>('/api/signing/configs', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        sign: (data: { config_id: string; data: string }) => apiRequest<any>('/api/signing/sign', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
        verify: (data: { signature: string; data: string; key_id: string }) =>
            apiRequest<any>('/api/signing/verify', {
                method: 'POST',
                body: JSON.stringify(data)
            })
    },

    // Projects
    projects: {
        list: (orgId?: string) => apiRequest<any[]>(
            orgId ? `/api/projects?organization_id=${orgId}` : '/api/projects'
        ),
        get: (id: string) => apiRequest<any>(`/api/projects/${id}`),
        create: (data: any) => apiRequest<any>('/api/projects', {
            method: 'POST',
            body: JSON.stringify(data)
        })
    },

    // Audit
    audit: {
        list: (params?: { user_id?: string; entity_type?: string }) => {
            const query = new URLSearchParams(params || {}).toString();
            return apiRequest<any[]>(`/api/audit${query ? `?${query}` : ''}`);
        }
    },

    // Auth
    auth: {
        me: () => apiRequest<any>('/api/auth/me'),
        refresh: () => apiRequest<any>('/api/auth/refresh', { method: 'POST' })
    }
};
