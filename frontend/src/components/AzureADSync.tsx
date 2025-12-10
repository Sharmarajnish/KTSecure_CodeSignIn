import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Clock, Users, Shield, ExternalLink } from 'lucide-react';

interface SyncStatus {
    id: string;
    name: string;
    status: 'synced' | 'syncing' | 'error' | 'pending';
    lastSync: string;
    userCount: number;
    groupCount: number;
}

// Mock sync statuses
const mockSyncData: SyncStatus[] = [
    { id: '1', name: 'Acme Corporation', status: 'synced', lastSync: '2024-12-10T12:00:00Z', userCount: 45, groupCount: 8 },
    { id: '2', name: 'SecureTech Inc', status: 'syncing', lastSync: '2024-12-10T11:30:00Z', userCount: 23, groupCount: 4 },
    { id: '3', name: 'Global Finance', status: 'error', lastSync: '2024-12-09T14:00:00Z', userCount: 12, groupCount: 3 },
];

export function AzureADSyncIndicator({ compact = false }: { compact?: boolean }) {
    const [syncStatuses, setSyncStatuses] = useState(mockSyncData);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const getStatusIcon = (status: SyncStatus['status']) => {
        switch (status) {
            case 'synced': return <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />;
            case 'syncing': return <RefreshCw size={16} className="animate-spin" style={{ color: 'var(--color-accent-primary)' }} />;
            case 'error': return <AlertCircle size={16} style={{ color: 'var(--color-error)' }} />;
            case 'pending': return <Clock size={16} style={{ color: 'var(--color-warning)' }} />;
        }
    };

    const getStatusText = (status: SyncStatus['status']) => {
        switch (status) {
            case 'synced': return 'Synced';
            case 'syncing': return 'Syncing...';
            case 'error': return 'Sync Error';
            case 'pending': return 'Pending';
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        // Simulate sync
        setTimeout(() => {
            setSyncStatuses(prev => prev.map(s => ({
                ...s,
                status: 'synced' as const,
                lastSync: new Date().toISOString()
            })));
            setIsRefreshing(false);
        }, 2000);
    };

    if (compact) {
        const syncedCount = syncStatuses.filter(s => s.status === 'synced').length;
        const errorCount = syncStatuses.filter(s => s.status === 'error').length;

        return (
            <div className="flex items-center gap-sm" style={{ padding: 'var(--spacing-sm)' }}>
                <Shield size={16} style={{ color: 'var(--color-accent-primary)' }} />
                <span className="text-sm">Azure AD:</span>
                <span className="badge badge-success">{syncedCount} synced</span>
                {errorCount > 0 && <span className="badge badge-error">{errorCount} failed</span>}
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex items-center gap-md">
                    <Shield size={20} style={{ color: 'var(--color-accent-primary)' }} />
                    <h3>Azure AD Sync Status</h3>
                </div>
                <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                >
                    <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                    {isRefreshing ? 'Syncing...' : 'Sync All'}
                </button>
            </div>

            <div style={{ padding: 'var(--spacing-md)' }}>
                {syncStatuses.map(org => (
                    <div
                        key={org.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: 'var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--color-bg-secondary)',
                            marginBottom: 'var(--spacing-sm)'
                        }}
                    >
                        <div className="flex items-center gap-md">
                            {getStatusIcon(org.status)}
                            <div>
                                <div style={{ fontWeight: 500 }}>{org.name}</div>
                                <div className="text-xs text-muted">
                                    Last sync: {new Date(org.lastSync).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-lg">
                            <div className="text-sm">
                                <Users size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                {org.userCount} users
                            </div>
                            <span className={`badge badge-${org.status === 'synced' ? 'success' : org.status === 'error' ? 'error' : 'secondary'}`}>
                                {getStatusText(org.status)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                padding: 'var(--spacing-md)',
                borderTop: '1px solid var(--color-border)',
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)'
            }}>
                <ExternalLink size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Configure in Azure Portal → Enterprise Applications
            </div>
        </div>
    );
}
