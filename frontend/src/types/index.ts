// Organization Types
export interface Organization {
    id: string;
    name: string;
    slug: string;
    status: 'active' | 'inactive' | 'pending';
    adminEmail: string;
    usersCount: number;
    keysCount: number;
    createdAt: string;
    updatedAt: string;
}

// User Types
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'operator' | 'viewer';
    organizationId: string;
    status: 'active' | 'invited' | 'disabled';
    lastLogin: string | null;
    createdAt: string;
}

// PKCS#11 Key Types
export type KeyAlgorithm = 'RSA-2048' | 'RSA-4096' | 'ECDSA-P256' | 'ECDSA-P384';
export type KeyStatus = 'active' | 'disabled' | 'expired' | 'pending';

export interface Pkcs11Key {
    id: string;
    name: string;
    algorithm: KeyAlgorithm;
    organizationId: string;
    status: KeyStatus;
    keyHandle: string;
    fingerprint: string;
    expiresAt: string | null;
    createdAt: string;
    lastUsed: string | null;
}

// Signing Configuration Types
export type HashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';

export interface SigningConfig {
    id: string;
    name: string;
    description: string;
    keyId: string;
    keyName: string;
    hashAlgorithm: HashAlgorithm;
    timestampUrl: string | null;
    organizationId: string;
    isEnabled: boolean;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}

// Project/ECU Types
export interface Project {
    id: string;
    name: string;
    description: string;
    ecuType: 'ADAS' | 'Powertrain' | 'Body' | 'Infotainment' | 'Gateway' | 'Other';
    organizationId: string;
    organizationName: string;
    linkedUserIds: string[];
    linkedConfigIds: string[];
    status: 'active' | 'archived';
    createdAt: string;
    updatedAt: string;
}

// Audit Log Types
export interface AuditLog {
    id: string;
    action: 'create' | 'update' | 'delete' | 'sign' | 'generate';
    entityType: 'organization' | 'user' | 'key' | 'config' | 'project';
    entityId: string;
    entityName: string;
    userId: string;
    userName: string;
    timestamp: string;
    changes: Record<string, { old: unknown; new: unknown }>;
}

// Certificate Types
export interface Certificate {
    id: string;
    keyId: string;
    keyName: string;
    caType: 'EJBCA' | 'MSCA';
    status: 'pending' | 'issued' | 'expired' | 'revoked';
    subject: string;
    issuer: string;
    serialNumber: string;
    validFrom: string;
    validTo: string;
    createdAt: string;
}
