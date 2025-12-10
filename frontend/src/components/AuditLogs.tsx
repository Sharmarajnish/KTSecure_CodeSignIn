import { useEffect, useState } from 'react';
import {
    Search,
    Filter,
    Download,
    Clock,
    Building2,
    Users,
    Key,
    FileSignature,
    Cpu,
    Plus,
    Edit,
    Trash2,
    FileCheck,
    Zap
} from 'lucide-react';
import type { AuditLog } from '../types';
import { api } from '../services/api';

const actionIcons: Record<string, React.ReactNode> = {
    create: <Plus size={16} />,
    update: <Edit size={16} />,
    delete: <Trash2 size={16} />,
    sign: <FileCheck size={16} />,
    generate: <Zap size={16} />
};

const actionColors: Record<string, string> = {
    create: 'var(--color-success)',
    update: 'var(--color-info)',
    delete: 'var(--color-error)',
    sign: 'var(--color-accent-primary)',
    generate: 'var(--color-warning)'
};

const entityIcons: Record<string, React.ReactNode> = {
    organization: <Building2 size={16} />,
    user: <Users size={16} />,
    key: <Key size={16} />,
    config: <FileSignature size={16} />,
    project: <Cpu size={16} />
};

export default function AuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterEntity, setFilterEntity] = useState<string>('');

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await api.getAuditLogs(filterEntity ? { entityType: filterEntity } : undefined);
                setLogs(data);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [filterEntity]);

    const filteredLogs = logs.filter(log =>
        log.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderChanges = (changes: Record<string, { old: unknown; new: unknown }>) => {
        const entries = Object.entries(changes);
        if (entries.length === 0) return null;

        return (
            <div style={{
                marginTop: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm)',
                background: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)'
            }}>
                {entries.map(([key, value]) => (
                    <div key={key} className="flex items-center gap-sm">
                        <span className="text-muted">{key}:</span>
                        {value.old !== null && (
                            <span style={{ color: 'var(--color-error)', textDecoration: 'line-through' }}>
                                {String(value.old)}
                            </span>
                        )}
                        <span style={{ color: 'var(--color-success)' }}>
                            {String(value.new)}
                        </span>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ height: '50vh' }}>
                <div className="animate-pulse text-muted">Loading audit logs...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Header Actions */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-md" style={{ flex: 1 }}>
                        <div className="search-input" style={{ maxWidth: '300px' }}>
                            <Search />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search logs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-sm">
                            <Filter size={16} className="text-muted" />
                            <select
                                className="form-input form-select"
                                value={filterEntity}
                                onChange={(e) => setFilterEntity(e.target.value)}
                                style={{ width: '180px' }}
                            >
                                <option value="">All Entities</option>
                                <option value="organization">Organizations</option>
                                <option value="user">Users</option>
                                <option value="key">Keys</option>
                                <option value="config">Configs</option>
                                <option value="project">Projects</option>
                            </select>
                        </div>
                    </div>
                    <button className="btn btn-secondary">
                        <Download size={18} />
                        Export Logs
                    </button>
                </div>
            </div>

            {/* Audit Log Timeline */}
            <div className="card">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {filteredLogs.map((log) => (
                        <div
                            key={log.id}
                            style={{
                                display: 'flex',
                                gap: 'var(--spacing-md)',
                                padding: 'var(--spacing-md)',
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                borderLeft: `3px solid ${actionColors[log.action]}`
                            }}
                        >
                            {/* Action Icon */}
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: 'var(--radius-md)',
                                background: `${actionColors[log.action]}20`,
                                color: actionColors[log.action],
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {actionIcons[log.action]}
                            </div>

                            {/* Content */}
                            <div style={{ flex: 1 }}>
                                <div className="flex items-center gap-sm">
                                    <span style={{
                                        fontWeight: 600,
                                        textTransform: 'capitalize',
                                        color: actionColors[log.action]
                                    }}>
                                        {log.action}
                                    </span>
                                    <span className="text-muted">•</span>
                                    <span className="flex items-center gap-sm">
                                        {entityIcons[log.entityType]}
                                        <span style={{ textTransform: 'capitalize' }}>{log.entityType}</span>
                                    </span>
                                </div>

                                <div style={{ fontWeight: 500, marginTop: '4px' }}>
                                    {log.entityName}
                                </div>

                                <div className="flex items-center gap-md text-muted text-sm" style={{ marginTop: '4px' }}>
                                    <span className="flex items-center gap-sm">
                                        <Users size={14} />
                                        {log.userName}
                                    </span>
                                    <span className="flex items-center gap-sm">
                                        <Clock size={14} />
                                        {formatTimestamp(log.timestamp)}
                                    </span>
                                </div>

                                {renderChanges(log.changes)}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredLogs.length === 0 && (
                    <div className="empty-state">
                        <Clock />
                        <div className="empty-state-title">No audit logs found</div>
                        <div className="empty-state-description">
                            {searchQuery || filterEntity ? 'Try different filters' : 'Actions will be logged here'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
