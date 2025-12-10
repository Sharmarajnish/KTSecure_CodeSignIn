import type { Organization, User, Pkcs11Key, SigningConfig, Project, AuditLog } from '../types';

// Mock data for development - Replace with actual API calls
const mockOrganizations: Organization[] = [
    {
        id: '1',
        name: 'Acme Corporation',
        slug: 'acme-corp',
        status: 'active',
        adminEmail: 'admin@acme.com',
        usersCount: 12,
        keysCount: 5,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-12-01T15:45:00Z'
    },
    {
        id: '2',
        name: 'TechStart Solutions',
        slug: 'techstart',
        status: 'active',
        adminEmail: 'security@techstart.io',
        usersCount: 8,
        keysCount: 3,
        createdAt: '2024-03-20T09:00:00Z',
        updatedAt: '2024-11-28T11:20:00Z'
    },
    {
        id: '3',
        name: 'SecureSign Ltd',
        slug: 'securesign',
        status: 'pending',
        adminEmail: 'ops@securesign.co',
        usersCount: 0,
        keysCount: 0,
        createdAt: '2024-12-05T14:00:00Z',
        updatedAt: '2024-12-05T14:00:00Z'
    }
];

const mockUsers: User[] = [
    { id: '1', email: 'admin@acme.com', name: 'John Admin', role: 'admin', organizationId: '1', status: 'active', lastLogin: '2024-12-09T08:30:00Z', createdAt: '2024-01-15T10:30:00Z' },
    { id: '2', email: 'ops@acme.com', name: 'Sarah Operator', role: 'operator', organizationId: '1', status: 'active', lastLogin: '2024-12-08T16:45:00Z', createdAt: '2024-02-20T11:00:00Z' },
    { id: '3', email: 'viewer@acme.com', name: 'Mike Viewer', role: 'viewer', organizationId: '1', status: 'invited', lastLogin: null, createdAt: '2024-12-01T09:00:00Z' },
    { id: '4', email: 'security@techstart.io', name: 'Alice Security', role: 'admin', organizationId: '2', status: 'active', lastLogin: '2024-12-09T10:00:00Z', createdAt: '2024-03-20T09:00:00Z' }
];

const mockKeys: Pkcs11Key[] = [
    { id: '1', name: 'Production Signing Key', algorithm: 'RSA-4096', organizationId: '1', status: 'active', keyHandle: 'pkcs11:id=%01', fingerprint: 'SHA256:A1B2C3D4...', expiresAt: '2026-01-15T00:00:00Z', createdAt: '2024-01-15T10:30:00Z', lastUsed: '2024-12-09T14:30:00Z' },
    { id: '2', name: 'Development Key', algorithm: 'RSA-2048', organizationId: '1', status: 'active', keyHandle: 'pkcs11:id=%02', fingerprint: 'SHA256:E5F6G7H8...', expiresAt: '2025-06-01T00:00:00Z', createdAt: '2024-03-10T08:00:00Z', lastUsed: '2024-12-08T16:00:00Z' },
    { id: '3', name: 'ECC Signing Key', algorithm: 'ECDSA-P384', organizationId: '1', status: 'active', keyHandle: 'pkcs11:id=%03', fingerprint: 'SHA256:I9J0K1L2...', expiresAt: null, createdAt: '2024-06-15T12:00:00Z', lastUsed: '2024-12-07T09:00:00Z' },
    { id: '4', name: 'Legacy RSA Key', algorithm: 'RSA-2048', organizationId: '1', status: 'disabled', keyHandle: 'pkcs11:id=%04', fingerprint: 'SHA256:M3N4O5P6...', expiresAt: '2024-06-01T00:00:00Z', createdAt: '2023-06-01T10:00:00Z', lastUsed: '2024-05-30T15:00:00Z' },
    { id: '5', name: 'TechStart Main Key', algorithm: 'RSA-4096', organizationId: '2', status: 'active', keyHandle: 'pkcs11:id=%05', fingerprint: 'SHA256:Q7R8S9T0...', expiresAt: '2026-03-20T00:00:00Z', createdAt: '2024-03-20T09:00:00Z', lastUsed: '2024-12-09T11:00:00Z' }
];

const mockSigningConfigs: SigningConfig[] = [
    { id: '1', name: 'Windows EXE Signing', description: 'Code signing for Windows executables', keyId: '1', keyName: 'Production Signing Key', hashAlgorithm: 'SHA-256', timestampUrl: 'http://timestamp.digicert.com', organizationId: '1', isEnabled: true, usageCount: 1523, createdAt: '2024-01-20T10:00:00Z', updatedAt: '2024-12-09T14:30:00Z' },
    { id: '2', name: 'macOS App Signing', description: 'Signing configuration for macOS applications', keyId: '1', keyName: 'Production Signing Key', hashAlgorithm: 'SHA-384', timestampUrl: 'http://timestamp.apple.com/ts01', organizationId: '1', isEnabled: true, usageCount: 892, createdAt: '2024-02-15T11:00:00Z', updatedAt: '2024-12-08T10:00:00Z' },
    { id: '3', name: 'Dev Build Signing', description: 'For development and testing builds', keyId: '2', keyName: 'Development Key', hashAlgorithm: 'SHA-256', timestampUrl: null, organizationId: '1', isEnabled: true, usageCount: 4521, createdAt: '2024-03-10T08:30:00Z', updatedAt: '2024-12-08T16:00:00Z' },
    { id: '4', name: 'ECC Firmware Signing', description: 'ECDSA signing for embedded firmware', keyId: '3', keyName: 'ECC Signing Key', hashAlgorithm: 'SHA-512', timestampUrl: 'http://timestamp.comodoca.com', organizationId: '1', isEnabled: false, usageCount: 156, createdAt: '2024-06-20T14:00:00Z', updatedAt: '2024-11-01T09:00:00Z' }
];

const mockProjects: Project[] = [
    { id: '1', name: 'ADAS Controller v3', description: 'Advanced Driver Assistance System ECU firmware', ecuType: 'ADAS', organizationId: '1', organizationName: 'Acme Corporation', linkedUserIds: ['1', '2'], linkedConfigIds: ['1'], status: 'active', createdAt: '2024-02-01T10:00:00Z', updatedAt: '2024-12-08T09:00:00Z' },
    { id: '2', name: 'Powertrain ECU 2025', description: 'Next-gen powertrain control unit', ecuType: 'Powertrain', organizationId: '1', organizationName: 'Acme Corporation', linkedUserIds: ['1'], linkedConfigIds: ['1', '3'], status: 'active', createdAt: '2024-03-15T14:00:00Z', updatedAt: '2024-12-09T11:00:00Z' },
    { id: '3', name: 'Infotainment System', description: 'In-vehicle infotainment platform', ecuType: 'Infotainment', organizationId: '1', organizationName: 'Acme Corporation', linkedUserIds: ['2', '3'], linkedConfigIds: ['2'], status: 'active', createdAt: '2024-04-20T08:00:00Z', updatedAt: '2024-12-07T16:00:00Z' },
    { id: '4', name: 'Gateway Module', description: 'Central gateway ECU for vehicle network', ecuType: 'Gateway', organizationId: '2', organizationName: 'TechStart Solutions', linkedUserIds: ['4'], linkedConfigIds: [], status: 'active', createdAt: '2024-05-10T11:00:00Z', updatedAt: '2024-12-05T15:00:00Z' }
];

const mockAuditLogs: AuditLog[] = [
    { id: '1', action: 'sign', entityType: 'config', entityId: '1', entityName: 'Windows EXE Signing', userId: '1', userName: 'John Admin', timestamp: '2024-12-09T14:30:00Z', changes: {} },
    { id: '2', action: 'generate', entityType: 'key', entityId: '5', entityName: 'TechStart Main Key', userId: '4', userName: 'Alice Security', timestamp: '2024-12-09T11:00:00Z', changes: { algorithm: { old: null, new: 'RSA-4096' } } },
    { id: '3', action: 'create', entityType: 'user', entityId: '3', entityName: 'Mike Viewer', userId: '1', userName: 'John Admin', timestamp: '2024-12-01T09:00:00Z', changes: { role: { old: null, new: 'viewer' } } },
    { id: '4', action: 'create', entityType: 'organization', entityId: '3', entityName: 'SecureSign Ltd', userId: '1', userName: 'John Admin', timestamp: '2024-12-05T14:00:00Z', changes: {} },
    { id: '5', action: 'update', entityType: 'config', entityId: '2', entityName: 'macOS App Signing', userId: '2', userName: 'Sarah Operator', timestamp: '2024-12-08T10:00:00Z', changes: { hashAlgorithm: { old: 'SHA-256', new: 'SHA-384' } } }
];

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API Service
export const api = {
    // Organizations
    getOrganizations: async (): Promise<Organization[]> => { await delay(300); return mockOrganizations; },
    getOrganization: async (id: string): Promise<Organization | undefined> => { await delay(200); return mockOrganizations.find(org => org.id === id); },
    createOrganization: async (data: Partial<Organization>): Promise<Organization> => {
        await delay(500);
        const newOrg: Organization = { id: String(mockOrganizations.length + 1), name: data.name || '', slug: data.slug || '', status: 'pending', adminEmail: data.adminEmail || '', usersCount: 0, keysCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        mockOrganizations.push(newOrg);
        return newOrg;
    },

    // Users
    getUsers: async (organizationId?: string): Promise<User[]> => { await delay(300); return organizationId ? mockUsers.filter(u => u.organizationId === organizationId) : mockUsers; },
    createUser: async (data: Partial<User>): Promise<User> => {
        await delay(500);
        const newUser: User = { id: String(mockUsers.length + 1), email: data.email || '', name: data.name || '', role: data.role || 'viewer', organizationId: data.organizationId || '1', status: 'invited', lastLogin: null, createdAt: new Date().toISOString() };
        mockUsers.push(newUser);
        return newUser;
    },

    // Keys
    getKeys: async (organizationId?: string): Promise<Pkcs11Key[]> => { await delay(300); return organizationId ? mockKeys.filter(k => k.organizationId === organizationId) : mockKeys; },
    createKey: async (data: Partial<Pkcs11Key>): Promise<Pkcs11Key> => {
        await delay(800);
        const newKey: Pkcs11Key = { id: String(mockKeys.length + 1), name: data.name || '', algorithm: data.algorithm || 'RSA-2048', organizationId: data.organizationId || '1', status: 'active', keyHandle: `pkcs11:id=%0${mockKeys.length + 1}`, fingerprint: `SHA256:${Math.random().toString(36).substring(2, 10).toUpperCase()}...`, expiresAt: null, createdAt: new Date().toISOString(), lastUsed: null };
        mockKeys.push(newKey);
        return newKey;
    },

    // Signing Configs
    getSigningConfigs: async (organizationId?: string): Promise<SigningConfig[]> => { await delay(300); return organizationId ? mockSigningConfigs.filter(c => c.organizationId === organizationId) : mockSigningConfigs; },
    createSigningConfig: async (data: Partial<SigningConfig>): Promise<SigningConfig> => {
        await delay(500);
        const key = mockKeys.find(k => k.id === data.keyId);
        const newConfig: SigningConfig = { id: String(mockSigningConfigs.length + 1), name: data.name || '', description: data.description || '', keyId: data.keyId || '', keyName: key?.name || '', hashAlgorithm: data.hashAlgorithm || 'SHA-256', timestampUrl: data.timestampUrl || null, organizationId: data.organizationId || '1', isEnabled: true, usageCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        mockSigningConfigs.push(newConfig);
        return newConfig;
    },

    // Projects
    getProjects: async (organizationId?: string): Promise<Project[]> => { await delay(300); return organizationId ? mockProjects.filter(p => p.organizationId === organizationId) : mockProjects; },
    createProject: async (data: Partial<Project>): Promise<Project> => {
        await delay(500);
        const org = mockOrganizations.find(o => o.id === data.organizationId);
        const newProject: Project = { id: String(mockProjects.length + 1), name: data.name || '', description: data.description || '', ecuType: data.ecuType || 'Other', organizationId: data.organizationId || '1', organizationName: org?.name || '', linkedUserIds: data.linkedUserIds || [], linkedConfigIds: data.linkedConfigIds || [], status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        mockProjects.push(newProject);
        return newProject;
    },

    // Audit Logs
    getAuditLogs: async (filters?: { entityType?: string; userId?: string }): Promise<AuditLog[]> => {
        await delay(300);
        let logs = mockAuditLogs;
        if (filters?.entityType) logs = logs.filter(l => l.entityType === filters.entityType);
        if (filters?.userId) logs = logs.filter(l => l.userId === filters.userId);
        return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },

    // Dashboard Stats
    getDashboardStats: async () => {
        await delay(200);
        return {
            totalOrganizations: mockOrganizations.length,
            activeOrganizations: mockOrganizations.filter(o => o.status === 'active').length,
            totalUsers: mockUsers.length,
            activeUsers: mockUsers.filter(u => u.status === 'active').length,
            totalKeys: mockKeys.length,
            activeKeys: mockKeys.filter(k => k.status === 'active').length,
            totalSigningConfigs: mockSigningConfigs.length,
            enabledConfigs: mockSigningConfigs.filter(c => c.isEnabled).length,
            totalProjects: mockProjects.length,
            recentActivity: [
                { type: 'signing', message: 'Windows EXE Signing used', time: '2 min ago' },
                { type: 'key', message: 'New key generated for TechStart', time: '15 min ago' },
                { type: 'user', message: 'User invited to Acme Corp', time: '1 hour ago' },
                { type: 'project', message: 'ADAS Controller updated', time: '3 hours ago' },
                { type: 'org', message: 'SecureSign Ltd created', time: '5 hours ago' }
            ]
        };
    }
};

