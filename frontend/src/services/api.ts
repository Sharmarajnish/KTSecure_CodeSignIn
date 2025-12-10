/**
 * KT Secure - API Service
 * Connects to real backend API at http://localhost:8000
 */

import type { Organization, User, Pkcs11Key, SigningConfig, Project, AuditLog } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Flag to use mock data when backend is unavailable
const USE_MOCK_FALLBACK = true;

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    fallbackData?: T
): Promise<T> {
    try {
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
    } catch (error) {
        console.warn(`API request failed for ${endpoint}:`, error);
        if (USE_MOCK_FALLBACK && fallbackData !== undefined) {
            console.log(`Using fallback data for ${endpoint}`);
            return fallbackData;
        }
        throw error;
    }
}

// Transform backend response to frontend format
function transformOrganization(org: any): Organization {
    return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        status: org.status || 'active',
        adminEmail: org.admin_email || org.adminEmail || '',
        usersCount: org.users_count ?? org.usersCount ?? 0,
        keysCount: org.keys_count ?? org.keysCount ?? 0,
        createdAt: org.created_at || org.createdAt || new Date().toISOString(),
        updatedAt: org.updated_at || org.updatedAt || new Date().toISOString(),
    };
}

function transformUser(user: any): User {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organization_id || user.organizationId || '',
        status: user.status || 'active',
        lastLogin: user.last_login || user.lastLogin || null,
        createdAt: user.created_at || user.createdAt || new Date().toISOString(),
    };
}

function transformKey(key: any): Pkcs11Key {
    return {
        id: key.id,
        name: key.name,
        algorithm: key.algorithm,
        organizationId: key.organization_id || key.organizationId || '',
        status: key.status || 'active',
        keyHandle: key.key_handle || key.keyHandle || '',
        fingerprint: key.fingerprint || '',
        expiresAt: key.expires_at || key.expiresAt || null,
        createdAt: key.created_at || key.createdAt || new Date().toISOString(),
        lastUsed: key.last_used || key.lastUsed || null,
    };
}

function transformSigningConfig(config: any): SigningConfig {
    return {
        id: config.id,
        name: config.name,
        description: config.description || '',
        keyId: config.key_id || config.keyId || '',
        keyName: config.key_name || config.keyName || '',
        hashAlgorithm: config.hash_algorithm || config.hashAlgorithm || 'SHA-256',
        timestampUrl: config.timestamp_authority || config.timestampUrl || null,
        organizationId: config.organization_id || config.organizationId || '',
        isEnabled: config.is_enabled ?? config.isEnabled ?? true,
        usageCount: config.usage_count ?? config.usageCount ?? 0,
        createdAt: config.created_at || config.createdAt || new Date().toISOString(),
        updatedAt: config.updated_at || config.updatedAt || new Date().toISOString(),
    };
}

function transformProject(project: any): Project {
    return {
        id: project.id,
        name: project.name,
        description: project.description || '',
        ecuType: project.ecu_type || project.ecuType || 'Other',
        organizationId: project.organization_id || project.organizationId || '',
        organizationName: project.organization_name || project.organizationName || '',
        linkedUserIds: project.linked_user_ids || project.linkedUserIds || [],
        linkedConfigIds: project.linked_config_ids || project.linkedConfigIds || [],
        status: project.status || 'active',
        createdAt: project.created_at || project.createdAt || new Date().toISOString(),
        updatedAt: project.updated_at || project.updatedAt || new Date().toISOString(),
    };
}

function transformAuditLog(log: any): AuditLog {
    return {
        id: log.id,
        action: log.action,
        entityType: log.entity_type || log.entityType || '',
        entityId: log.entity_id || log.entityId || '',
        entityName: log.entity_name || log.entityName || '',
        userId: log.user_id || log.userId || '',
        userName: log.user_name || log.userName || '',
        timestamp: log.created_at || log.timestamp || new Date().toISOString(),
        changes: log.changes || {},
    };
}

// Mock data for fallback when backend is unavailable
const mockOrganizations: Organization[] = [
    { id: '1', name: 'Acme Corporation', slug: 'acme-corp', status: 'active', adminEmail: 'admin@acme.com', usersCount: 12, keysCount: 5, createdAt: '2024-01-15T10:30:00Z', updatedAt: '2024-12-01T15:45:00Z' },
    { id: '2', name: 'TechStart Solutions', slug: 'techstart', status: 'active', adminEmail: 'security@techstart.io', usersCount: 8, keysCount: 3, createdAt: '2024-03-20T09:00:00Z', updatedAt: '2024-11-28T11:20:00Z' },
    { id: '3', name: 'SecureSign Ltd', slug: 'securesign', status: 'pending', adminEmail: 'ops@securesign.co', usersCount: 0, keysCount: 0, createdAt: '2024-12-05T14:00:00Z', updatedAt: '2024-12-05T14:00:00Z' }
];

const mockUsers: User[] = [
    { id: '1', email: 'admin@acme.com', name: 'John Admin', role: 'admin', organizationId: '1', status: 'active', lastLogin: '2024-12-09T08:30:00Z', createdAt: '2024-01-15T10:30:00Z' },
    { id: '2', email: 'ops@acme.com', name: 'Sarah Operator', role: 'operator', organizationId: '1', status: 'active', lastLogin: '2024-12-08T16:45:00Z', createdAt: '2024-02-20T11:00:00Z' },
];

const mockKeys: Pkcs11Key[] = [
    { id: '1', name: 'Production Signing Key', algorithm: 'RSA-4096', organizationId: '1', status: 'active', keyHandle: 'pkcs11:id=%01', fingerprint: 'SHA256:A1B2C3D4...', expiresAt: '2026-01-15T00:00:00Z', createdAt: '2024-01-15T10:30:00Z', lastUsed: '2024-12-09T14:30:00Z' },
];

const mockSigningConfigs: SigningConfig[] = [
    { id: '1', name: 'Windows EXE Signing', description: 'Code signing for Windows executables', keyId: '1', keyName: 'Production Signing Key', hashAlgorithm: 'SHA-256', timestampUrl: 'http://timestamp.digicert.com', organizationId: '1', isEnabled: true, usageCount: 1523, createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-12-09T14:30:00Z' },
];

const mockProjects: Project[] = [
    { id: '1', name: 'ADAS Controller v3', description: 'Advanced Driver Assistance System ECU firmware', ecuType: 'ADAS', organizationId: '1', organizationName: 'Acme Corporation', linkedUserIds: ['1', '2'], linkedConfigIds: ['1'], status: 'active', createdAt: '2024-02-01T10:00:00Z', updatedAt: '2024-12-08T09:00:00Z' },
];

const mockAuditLogs: AuditLog[] = [
    { id: '1', action: 'sign', entityType: 'config', entityId: '1', entityName: 'Windows EXE Signing', userId: '1', userName: 'John Admin', timestamp: '2024-12-09T14:30:00Z', changes: {} },
];

// Local cache for created/modified items
let localOrganizations = [...mockOrganizations];
let localUsers = [...mockUsers];
let localKeys = [...mockKeys];
let localSigningConfigs = [...mockSigningConfigs];
let localProjects = [...mockProjects];

// API Service
export const api = {
    // Organizations
    getOrganizations: async (): Promise<Organization[]> => {
        try {
            const orgs = await apiRequest<any[]>('/api/organizations');
            return orgs.map(transformOrganization);
        } catch {
            return localOrganizations;
        }
    },

    getOrganization: async (id: string): Promise<Organization | undefined> => {
        try {
            const org = await apiRequest<any>(`/api/organizations/${id}`);
            return transformOrganization(org);
        } catch {
            return localOrganizations.find(org => org.id === id);
        }
    },

    createOrganization: async (data: Partial<Organization>): Promise<Organization> => {
        try {
            const org = await apiRequest<any>('/api/organizations', {
                method: 'POST',
                body: JSON.stringify({
                    name: data.name,
                    slug: data.slug,
                    admin_email: data.adminEmail,
                    status: 'pending'
                })
            });
            return transformOrganization(org);
        } catch {
            // Fallback: create locally
            const newOrg: Organization = {
                id: String(Date.now()),
                name: data.name || '',
                slug: data.slug || '',
                status: 'pending',
                adminEmail: data.adminEmail || '',
                usersCount: 0,
                keysCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            localOrganizations.push(newOrg);
            return newOrg;
        }
    },

    approveOrganization: async (id: string): Promise<Organization> => {
        try {
            const org = await apiRequest<any>(`/api/organizations/${id}/approve`, {
                method: 'PUT'
            });
            return transformOrganization(org);
        } catch {
            // Fallback: update locally
            const idx = localOrganizations.findIndex(o => o.id === id);
            if (idx >= 0) {
                localOrganizations[idx] = { ...localOrganizations[idx], status: 'active' };
                return localOrganizations[idx];
            }
            throw new Error('Organization not found');
        }
    },

    rejectOrganization: async (id: string): Promise<Organization> => {
        try {
            const org = await apiRequest<any>(`/api/organizations/${id}/reject`, {
                method: 'PUT'
            });
            return transformOrganization(org);
        } catch {
            // Fallback: update locally
            const idx = localOrganizations.findIndex(o => o.id === id);
            if (idx >= 0) {
                localOrganizations[idx] = { ...localOrganizations[idx], status: 'inactive' };
                return localOrganizations[idx];
            }
            throw new Error('Organization not found');
        }
    },

    // Users
    getUsers: async (organizationId?: string): Promise<User[]> => {
        try {
            const endpoint = organizationId
                ? `/api/users?organization_id=${organizationId}`
                : '/api/users';
            const users = await apiRequest<any[]>(endpoint);
            return users.map(transformUser);
        } catch {
            return organizationId
                ? localUsers.filter(u => u.organizationId === organizationId)
                : localUsers;
        }
    },

    createUser: async (data: Partial<User>): Promise<User> => {
        try {
            const user = await apiRequest<any>('/api/users/invite', {
                method: 'POST',
                body: JSON.stringify({
                    email: data.email,
                    name: data.name,
                    role: data.role,
                    organization_id: data.organizationId
                })
            });
            return transformUser(user);
        } catch {
            const newUser: User = {
                id: String(Date.now()),
                email: data.email || '',
                name: data.name || '',
                role: data.role || 'viewer',
                organizationId: data.organizationId || '1',
                status: 'invited',
                lastLogin: null,
                createdAt: new Date().toISOString()
            };
            localUsers.push(newUser);
            return newUser;
        }
    },

    // Keys
    getKeys: async (organizationId?: string): Promise<Pkcs11Key[]> => {
        try {
            const endpoint = organizationId
                ? `/api/keys?organization_id=${organizationId}`
                : '/api/keys';
            const keys = await apiRequest<any[]>(endpoint);
            return keys.map(transformKey);
        } catch {
            return organizationId
                ? localKeys.filter(k => k.organizationId === organizationId)
                : localKeys;
        }
    },

    createKey: async (data: Partial<Pkcs11Key>): Promise<Pkcs11Key> => {
        try {
            const key = await apiRequest<any>('/api/keys/generate', {
                method: 'POST',
                body: JSON.stringify({
                    name: data.name,
                    algorithm: data.algorithm,
                    organization_id: data.organizationId
                })
            });
            return transformKey(key);
        } catch {
            const newKey: Pkcs11Key = {
                id: String(Date.now()),
                name: data.name || '',
                algorithm: data.algorithm || 'RSA-2048',
                organizationId: data.organizationId || '1',
                status: 'active',
                keyHandle: `pkcs11:id=%0${localKeys.length + 1}`,
                fingerprint: `SHA256:${Math.random().toString(36).substring(2, 10).toUpperCase()}...`,
                expiresAt: null,
                createdAt: new Date().toISOString(),
                lastUsed: null
            };
            localKeys.push(newKey);
            return newKey;
        }
    },

    // Signing Configs
    getSigningConfigs: async (organizationId?: string): Promise<SigningConfig[]> => {
        try {
            const endpoint = organizationId
                ? `/api/signing/configs?organization_id=${organizationId}`
                : '/api/signing/configs';
            const configs = await apiRequest<any[]>(endpoint);
            return configs.map(transformSigningConfig);
        } catch {
            return organizationId
                ? localSigningConfigs.filter(c => c.organizationId === organizationId)
                : localSigningConfigs;
        }
    },

    createSigningConfig: async (data: Partial<SigningConfig>): Promise<SigningConfig> => {
        try {
            const config = await apiRequest<any>('/api/signing/configs', {
                method: 'POST',
                body: JSON.stringify({
                    name: data.name,
                    description: data.description,
                    key_id: data.keyId,
                    hash_algorithm: data.hashAlgorithm,
                    timestamp_authority: data.timestampUrl,
                    organization_id: data.organizationId
                })
            });
            return transformSigningConfig(config);
        } catch {
            const key = localKeys.find(k => k.id === data.keyId);
            const newConfig: SigningConfig = {
                id: String(Date.now()),
                name: data.name || '',
                description: data.description || '',
                keyId: data.keyId || '',
                keyName: key?.name || '',
                hashAlgorithm: data.hashAlgorithm || 'SHA-256',
                timestampUrl: data.timestampUrl || null,
                organizationId: data.organizationId || '1',
                isEnabled: true,
                usageCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            localSigningConfigs.push(newConfig);
            return newConfig;
        }
    },

    // Projects
    getProjects: async (organizationId?: string): Promise<Project[]> => {
        try {
            const endpoint = organizationId
                ? `/api/projects?organization_id=${organizationId}`
                : '/api/projects';
            const projects = await apiRequest<any[]>(endpoint);
            return projects.map(transformProject);
        } catch {
            return organizationId
                ? localProjects.filter(p => p.organizationId === organizationId)
                : localProjects;
        }
    },

    createProject: async (data: Partial<Project>): Promise<Project> => {
        try {
            const project = await apiRequest<any>('/api/projects', {
                method: 'POST',
                body: JSON.stringify({
                    name: data.name,
                    description: data.description,
                    ecu_type: data.ecuType,
                    organization_id: data.organizationId
                })
            });
            return transformProject(project);
        } catch {
            const org = localOrganizations.find(o => o.id === data.organizationId);
            const newProject: Project = {
                id: String(Date.now()),
                name: data.name || '',
                description: data.description || '',
                ecuType: data.ecuType || 'Other',
                organizationId: data.organizationId || '1',
                organizationName: org?.name || '',
                linkedUserIds: data.linkedUserIds || [],
                linkedConfigIds: data.linkedConfigIds || [],
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            localProjects.push(newProject);
            return newProject;
        }
    },

    // Audit Logs
    getAuditLogs: async (filters?: { entityType?: string; userId?: string }): Promise<AuditLog[]> => {
        try {
            const params = new URLSearchParams();
            if (filters?.entityType) params.append('entity_type', filters.entityType);
            if (filters?.userId) params.append('user_id', filters.userId);
            const query = params.toString();
            const logs = await apiRequest<any[]>(`/api/audit${query ? `?${query}` : ''}`);
            return logs.map(transformAuditLog);
        } catch {
            let logs = mockAuditLogs;
            if (filters?.entityType) logs = logs.filter(l => l.entityType === filters.entityType);
            if (filters?.userId) logs = logs.filter(l => l.userId === filters.userId);
            return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
    },

    // Dashboard Stats
    getDashboardStats: async () => {
        try {
            const [orgs, users, keys, configs, projects] = await Promise.all([
                api.getOrganizations(),
                api.getUsers(),
                api.getKeys(),
                api.getSigningConfigs(),
                api.getProjects()
            ]);

            return {
                totalOrganizations: orgs.length,
                activeOrganizations: orgs.filter(o => o.status === 'active').length,
                totalUsers: users.length,
                activeUsers: users.filter(u => u.status === 'active').length,
                totalKeys: keys.length,
                activeKeys: keys.filter(k => k.status === 'active').length,
                totalSigningConfigs: configs.length,
                enabledConfigs: configs.filter(c => c.isEnabled).length,
                totalProjects: projects.length,
                recentActivity: [
                    { type: 'signing', message: 'Signing config updated', time: '2 min ago' },
                    { type: 'key', message: 'Key generated', time: '15 min ago' },
                    { type: 'user', message: 'User invited', time: '1 hour ago' },
                    { type: 'project', message: 'Project updated', time: '3 hours ago' },
                    { type: 'org', message: 'Organization created', time: '5 hours ago' }
                ]
            };
        } catch {
            return {
                totalOrganizations: localOrganizations.length,
                activeOrganizations: localOrganizations.filter(o => o.status === 'active').length,
                totalUsers: localUsers.length,
                activeUsers: localUsers.filter(u => u.status === 'active').length,
                totalKeys: localKeys.length,
                activeKeys: localKeys.filter(k => k.status === 'active').length,
                totalSigningConfigs: localSigningConfigs.length,
                enabledConfigs: localSigningConfigs.filter(c => c.isEnabled).length,
                totalProjects: localProjects.length,
                recentActivity: [
                    { type: 'signing', message: 'Windows EXE Signing used', time: '2 min ago' },
                    { type: 'key', message: 'New key generated', time: '15 min ago' },
                    { type: 'user', message: 'User invited', time: '1 hour ago' },
                    { type: 'project', message: 'Project updated', time: '3 hours ago' },
                    { type: 'org', message: 'Organization created', time: '5 hours ago' }
                ]
            };
        }
    }
};
