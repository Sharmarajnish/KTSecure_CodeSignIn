import { useMemo } from 'react';
import { Key, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface KeyData {
    id: string;
    name: string;
    algorithm: string;
    createdAt: string;
    expiresAt: string | null;
    lastUsed: string | null;
    usageCount: number;
    status: 'active' | 'expiring_soon' | 'expired' | 'inactive';
}

interface KeyRotationHeatmapProps {
    keys?: KeyData[];
}

// Mock data for demonstration
const mockKeys: KeyData[] = [
    { id: '1', name: 'prod-signing-key', algorithm: 'RSA-4096', createdAt: '2024-01-15', expiresAt: '2025-01-15', lastUsed: '2024-12-09', usageCount: 1250, status: 'active' },
    { id: '2', name: 'firmware-key-v2', algorithm: 'ECDSA-P384', createdAt: '2024-03-20', expiresAt: '2025-03-20', lastUsed: '2024-12-08', usageCount: 890, status: 'active' },
    { id: '3', name: 'docs-signing', algorithm: 'RSA-2048', createdAt: '2024-06-01', expiresAt: '2024-12-31', lastUsed: '2024-12-05', usageCount: 340, status: 'expiring_soon' },
    { id: '4', name: 'legacy-key-2023', algorithm: 'RSA-2048', createdAt: '2023-01-01', expiresAt: '2024-01-01', lastUsed: '2023-12-20', usageCount: 2100, status: 'expired' },
    { id: '5', name: 'test-signing', algorithm: 'ECDSA-P256', createdAt: '2024-09-01', expiresAt: '2025-09-01', lastUsed: '2024-11-15', usageCount: 45, status: 'active' },
    { id: '6', name: 'backup-key-001', algorithm: 'RSA-4096', createdAt: '2024-02-10', expiresAt: '2025-02-10', lastUsed: null, usageCount: 0, status: 'inactive' },
    { id: '7', name: 'mobile-signing', algorithm: 'ECDSA-P256', createdAt: '2024-07-15', expiresAt: '2025-01-15', lastUsed: '2024-12-09', usageCount: 567, status: 'expiring_soon' },
    { id: '8', name: 'api-gateway-key', algorithm: 'RSA-4096', createdAt: '2024-04-01', expiresAt: '2025-04-01', lastUsed: '2024-12-09', usageCount: 1890, status: 'active' },
];

// Calculate months for the heatmap
function getMonthsRange(startDate: Date, months: number): { month: string; year: number }[] {
    const result = [];
    const current = new Date(startDate);

    for (let i = 0; i < months; i++) {
        result.push({
            month: current.toLocaleString('default', { month: 'short' }),
            year: current.getFullYear()
        });
        current.setMonth(current.getMonth() + 1);
    }

    return result;
}

// Get color based on key health
function getHealthColor(key: KeyData): string {
    if (key.status === 'expired') return 'var(--color-error)';
    if (key.status === 'expiring_soon') return 'var(--color-warning)';
    if (key.status === 'inactive') return 'var(--color-text-muted)';

    // Calculate days until expiration
    if (key.expiresAt) {
        const daysUntil = Math.floor((new Date(key.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysUntil < 30) return 'var(--color-warning)';
        if (daysUntil < 90) return '#f59e0b'; // amber
    }

    return 'var(--color-success)';
}

// Get intensity based on usage
function getUsageIntensity(usageCount: number, maxUsage: number): number {
    if (maxUsage === 0) return 0.2;
    return 0.2 + (usageCount / maxUsage) * 0.8;
}

export function KeyRotationHeatmap({ keys = mockKeys }: KeyRotationHeatmapProps) {
    const months = useMemo(() => {
        const now = new Date();
        now.setMonth(now.getMonth() - 3);
        return getMonthsRange(now, 12);
    }, []);

    const maxUsage = useMemo(() => Math.max(...keys.map(k => k.usageCount)), [keys]);

    const statusCounts = useMemo(() => ({
        active: keys.filter(k => k.status === 'active').length,
        expiring: keys.filter(k => k.status === 'expiring_soon').length,
        expired: keys.filter(k => k.status === 'expired').length,
        inactive: keys.filter(k => k.status === 'inactive').length
    }), [keys]);

    return (
        <div className="card">
            <div className="card-header">
                <div>
                    <h3 className="card-title">Key Rotation Heatmap</h3>
                    <p className="card-subtitle">Key health and expiration timeline</p>
                </div>
            </div>

            {/* Status Summary */}
            <div style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                display: 'flex',
                gap: 'var(--spacing-lg)',
                borderBottom: '1px solid var(--color-border)'
            }}>
                <div className="flex items-center gap-sm">
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-success)'
                    }} />
                    <span className="text-sm">{statusCounts.active} Active</span>
                </div>
                <div className="flex items-center gap-sm">
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-warning)'
                    }} />
                    <span className="text-sm">{statusCounts.expiring} Expiring Soon</span>
                </div>
                <div className="flex items-center gap-sm">
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-error)'
                    }} />
                    <span className="text-sm">{statusCounts.expired} Expired</span>
                </div>
                <div className="flex items-center gap-sm">
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--color-text-muted)'
                    }} />
                    <span className="text-sm">{statusCounts.inactive} Inactive</span>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div style={{ padding: 'var(--spacing-lg)', overflowX: 'auto' }}>
                {/* Month Headers */}
                <div style={{ display: 'flex', marginLeft: '160px', marginBottom: 'var(--spacing-sm)' }}>
                    {months.map((m, i) => (
                        <div
                            key={i}
                            style={{
                                width: '50px',
                                textAlign: 'center',
                                fontSize: '0.75rem',
                                color: 'var(--color-text-muted)'
                            }}
                        >
                            {m.month}
                        </div>
                    ))}
                </div>

                {/* Key Rows */}
                {keys.map(key => {
                    const healthColor = getHealthColor(key);
                    const intensity = getUsageIntensity(key.usageCount, maxUsage);

                    // Calculate which months this key is active
                    const keyCreated = new Date(key.createdAt);
                    const keyExpires = key.expiresAt ? new Date(key.expiresAt) : null;

                    return (
                        <div
                            key={key.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: 'var(--spacing-xs)'
                            }}
                        >
                            {/* Key Name */}
                            <div style={{
                                width: '150px',
                                paddingRight: 'var(--spacing-md)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-xs)'
                            }}>
                                <Key size={14} style={{ color: healthColor }} />
                                <span
                                    style={{
                                        fontSize: '0.85rem',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                    title={key.name}
                                >
                                    {key.name}
                                </span>
                            </div>

                            {/* Month Cells */}
                            <div style={{ display: 'flex' }}>
                                {months.map((m, i) => {
                                    const monthDate = new Date(m.year, new Date(`${m.month} 1, ${m.year}`).getMonth(), 1);
                                    const isActive = monthDate >= keyCreated && (!keyExpires || monthDate <= keyExpires);
                                    const isExpireMonth = keyExpires &&
                                        keyExpires.getMonth() === monthDate.getMonth() &&
                                        keyExpires.getFullYear() === monthDate.getFullYear();

                                    return (
                                        <div
                                            key={i}
                                            style={{
                                                width: '50px',
                                                height: '24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: '40px',
                                                    height: '16px',
                                                    borderRadius: 'var(--radius-sm)',
                                                    background: isActive
                                                        ? healthColor
                                                        : 'var(--color-bg-tertiary)',
                                                    opacity: isActive ? intensity : 0.3,
                                                    position: 'relative',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                title={`${key.name} - ${m.month} ${m.year}${isExpireMonth ? ' (Expires)' : ''}`}
                                            >
                                                {isExpireMonth && (
                                                    <AlertTriangle size={10} style={{ color: 'white' }} />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Status Icon */}
                            <div style={{ marginLeft: 'var(--spacing-sm)' }}>
                                {key.status === 'active' && <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />}
                                {key.status === 'expiring_soon' && <Clock size={16} style={{ color: 'var(--color-warning)' }} />}
                                {key.status === 'expired' && <AlertTriangle size={16} style={{ color: 'var(--color-error)' }} />}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div className="flex items-center gap-md">
                    <span className="text-sm text-muted">Usage Intensity:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {[0.2, 0.4, 0.6, 0.8, 1].map((opacity, i) => (
                            <div
                                key={i}
                                style={{
                                    width: '16px',
                                    height: '12px',
                                    background: 'var(--color-accent-primary)',
                                    opacity,
                                    borderRadius: '2px'
                                }}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-muted">Low → High</span>
                </div>
                <button className="btn btn-sm btn-secondary">
                    <Key size={14} />
                    Rotate Keys
                </button>
            </div>
        </div>
    );
}

export default KeyRotationHeatmap;
