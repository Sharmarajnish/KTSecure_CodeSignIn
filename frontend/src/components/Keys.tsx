import { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    MoreVertical,
    Key,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    Copy,
    X,
    Shield
} from 'lucide-react';
import type { Pkcs11Key, KeyAlgorithm } from '../types';
import { api } from '../services/api';

export default function Keys() {
    const [keys, setKeys] = useState<Pkcs11Key[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        algorithm: 'RSA-4096' as KeyAlgorithm
    });

    useEffect(() => {
        const fetchKeys = async () => {
            try {
                const data = await api.getKeys();
                setKeys(data);
            } finally {
                setLoading(false);
            }
        };
        fetchKeys();
    }, []);

    const filteredKeys = keys.filter(key =>
        key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.fingerprint.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: Pkcs11Key['status']) => {
        switch (status) {
            case 'active':
                return <span className="badge badge-success"><CheckCircle2 size={12} />Active</span>;
            case 'disabled':
                return <span className="badge badge-error"><XCircle size={12} />Disabled</span>;
            case 'expired':
                return <span className="badge badge-warning"><AlertTriangle size={12} />Expired</span>;
            case 'pending':
                return <span className="badge badge-info"><Clock size={12} />Pending</span>;
        }
    };

    const getAlgorithmBadge = (algorithm: KeyAlgorithm) => {
        const isRSA = algorithm.startsWith('RSA');
        return (
            <span className={`badge ${isRSA ? 'badge-primary' : 'badge-info'}`}>
                <Shield size={12} />
                {algorithm}
            </span>
        );
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleCreateKey = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const newKey = await api.createKey(formData);
            setKeys([...keys, newKey]);
            setShowCreateModal(false);
            setFormData({ name: '', algorithm: 'RSA-4096' });
        } catch (error) {
            console.error('Failed to create key:', error);
        } finally {
            setCreating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ height: '50vh' }}>
                <div className="animate-pulse text-muted">Loading keys...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Header Actions */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="flex items-center justify-between">
                    <div className="search-input" style={{ flex: 1, maxWidth: '400px' }}>
                        <Search />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search keys..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        <Plus size={18} />
                        Generate Key
                    </button>
                </div>
            </div>

            {/* Keys Table */}
            <div className="card" style={{ padding: 0 }}>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Key Name</th>
                                <th>Algorithm</th>
                                <th>Status</th>
                                <th>Fingerprint</th>
                                <th>Expires</th>
                                <th>Last Used</th>
                                <th style={{ width: '60px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredKeys.map((key) => (
                                <tr key={key.id}>
                                    <td>
                                        <div className="flex items-center gap-md">
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: 'var(--radius-md)',
                                                background: key.status === 'active'
                                                    ? 'rgba(16, 185, 129, 0.15)'
                                                    : 'var(--color-bg-tertiary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: key.status === 'active'
                                                    ? 'var(--color-success)'
                                                    : 'var(--color-text-muted)'
                                            }}>
                                                <Key size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{key.name}</div>
                                                <div className="text-muted text-sm font-mono">{key.keyHandle}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{getAlgorithmBadge(key.algorithm)}</td>
                                    <td>{getStatusBadge(key.status)}</td>
                                    <td>
                                        <div className="flex items-center gap-sm">
                                            <code className="font-mono text-sm" style={{
                                                background: 'var(--color-bg-tertiary)',
                                                padding: '2px 8px',
                                                borderRadius: 'var(--radius-sm)'
                                            }}>
                                                {key.fingerprint}
                                            </code>
                                            <button
                                                className="btn btn-ghost btn-icon"
                                                style={{ width: '28px', height: '28px' }}
                                                onClick={() => copyToClipboard(key.fingerprint)}
                                                title="Copy fingerprint"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="text-muted text-sm">
                                        {key.expiresAt
                                            ? new Date(key.expiresAt).toLocaleDateString()
                                            : <span style={{ fontStyle: 'italic' }}>Never</span>
                                        }
                                    </td>
                                    <td className="text-muted text-sm">
                                        {key.lastUsed
                                            ? new Date(key.lastUsed).toLocaleString()
                                            : <span style={{ fontStyle: 'italic' }}>Never</span>
                                        }
                                    </td>
                                    <td>
                                        <button className="btn btn-ghost btn-icon">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredKeys.length === 0 && (
                    <div className="empty-state">
                        <Key />
                        <div className="empty-state-title">No keys found</div>
                        <div className="empty-state-description">
                            {searchQuery ? 'Try a different search term' : 'Generate your first PKCS#11 key'}
                        </div>
                        {!searchQuery && (
                            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                                <Plus size={18} />
                                Generate Key
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Generate PKCS#11 Key</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateKey}>
                            <div className="modal-body">
                                <div style={{
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: 'var(--spacing-md)',
                                    marginBottom: 'var(--spacing-lg)',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 'var(--spacing-sm)'
                                }}>
                                    <Shield size={18} style={{ color: 'var(--color-accent-primary)', flexShrink: 0, marginTop: '2px' }} />
                                    <div className="text-sm">
                                        Keys are generated securely within the HSM and never leave the hardware security boundary.
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Key Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., Production Signing Key"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Algorithm</label>
                                    <select
                                        className="form-input form-select"
                                        value={formData.algorithm}
                                        onChange={(e) => setFormData({ ...formData, algorithm: e.target.value as KeyAlgorithm })}
                                    >
                                        <optgroup label="RSA">
                                            <option value="RSA-2048">RSA 2048-bit</option>
                                            <option value="RSA-4096">RSA 4096-bit (Recommended)</option>
                                        </optgroup>
                                        <optgroup label="ECDSA">
                                            <option value="ECDSA-P256">ECDSA P-256</option>
                                            <option value="ECDSA-P384">ECDSA P-384</option>
                                        </optgroup>
                                    </select>
                                    <div className="text-muted text-sm" style={{ marginTop: '4px' }}>
                                        RSA-4096 is recommended for maximum compatibility and security
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={creating}>
                                    {creating ? 'Generating...' : 'Generate Key'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
