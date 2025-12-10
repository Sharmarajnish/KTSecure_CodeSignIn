import { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    MoreVertical,
    FileSignature,
    Key,
    Clock,
    Hash,
    Link,
    X,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import type { SigningConfig, Pkcs11Key, HashAlgorithm } from '../types';
import { api } from '../services/api';

export default function SigningConfigs() {
    const [configs, setConfigs] = useState<SigningConfig[]>([]);
    const [keys, setKeys] = useState<Pkcs11Key[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        keyId: '',
        hashAlgorithm: 'SHA-256' as HashAlgorithm,
        timestampUrl: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [configsData, keysData] = await Promise.all([
                    api.getSigningConfigs(),
                    api.getKeys()
                ]);
                setConfigs(configsData);
                setKeys(keysData.filter(k => k.status === 'active'));
                if (keysData.length > 0 && !formData.keyId) {
                    setFormData(prev => ({ ...prev, keyId: keysData[0].id }));
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredConfigs = configs.filter(config =>
        config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleConfig = (configId: string) => {
        setConfigs(configs.map(c =>
            c.id === configId ? { ...c, isEnabled: !c.isEnabled } : c
        ));
    };

    const handleCreateConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newConfig = await api.createSigningConfig({
                ...formData,
                timestampUrl: formData.timestampUrl || null
            });
            setConfigs([...configs, newConfig]);
            setShowCreateModal(false);
            setFormData({ name: '', description: '', keyId: keys[0]?.id || '', hashAlgorithm: 'SHA-256', timestampUrl: '' });
        } catch (error) {
            console.error('Failed to create config:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ height: '50vh' }}>
                <div className="animate-pulse text-muted">Loading configurations...</div>
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
                            placeholder="Search configurations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        <Plus size={18} />
                        Create Configuration
                    </button>
                </div>
            </div>

            {/* Configs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--spacing-lg)' }}>
                {filteredConfigs.map((config) => (
                    <div key={config.id} className="card" style={{
                        position: 'relative',
                        borderLeft: `4px solid ${config.isEnabled ? 'var(--color-success)' : 'var(--color-text-muted)'}`,
                        opacity: config.isEnabled ? 1 : 0.7
                    }}>
                        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-md)' }}>
                            <div className="flex items-center gap-md">
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: 'var(--radius-md)',
                                    background: config.isEnabled
                                        ? 'var(--color-accent-gradient)'
                                        : 'var(--color-bg-tertiary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FileSignature size={22} color={config.isEnabled ? 'white' : 'var(--color-text-muted)'} />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>{config.name}</h3>
                                    <p className="text-muted text-sm">{config.description}</p>
                                </div>
                            </div>
                            <button className="btn btn-ghost btn-icon">
                                <MoreVertical size={18} />
                            </button>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 'var(--spacing-md)',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            <div style={{
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                padding: 'var(--spacing-sm) var(--spacing-md)'
                            }}>
                                <div className="flex items-center gap-sm text-muted text-sm">
                                    <Key size={14} />
                                    Key
                                </div>
                                <div style={{ fontWeight: 500, marginTop: '2px' }}>{config.keyName}</div>
                            </div>
                            <div style={{
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                padding: 'var(--spacing-sm) var(--spacing-md)'
                            }}>
                                <div className="flex items-center gap-sm text-muted text-sm">
                                    <Hash size={14} />
                                    Hash
                                </div>
                                <div style={{ fontWeight: 500, marginTop: '2px' }}>{config.hashAlgorithm}</div>
                            </div>
                        </div>

                        {config.timestampUrl && (
                            <div style={{
                                background: 'var(--color-bg-tertiary)',
                                borderRadius: 'var(--radius-md)',
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                marginBottom: 'var(--spacing-md)'
                            }}>
                                <div className="flex items-center gap-sm text-muted text-sm">
                                    <Link size={14} />
                                    Timestamp Authority
                                </div>
                                <div className="font-mono text-sm truncate" style={{ marginTop: '2px' }}>
                                    {config.timestampUrl}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between" style={{
                            paddingTop: 'var(--spacing-md)',
                            borderTop: '1px solid var(--color-border)'
                        }}>
                            <div className="flex items-center gap-md">
                                <div className="text-sm">
                                    <span className="text-muted">Usage: </span>
                                    <span style={{ fontWeight: 600 }}>{config.usageCount.toLocaleString()}</span>
                                </div>
                                <div className="text-sm text-muted flex items-center gap-sm">
                                    <Clock size={14} />
                                    {new Date(config.updatedAt).toLocaleDateString()}
                                </div>
                            </div>

                            <button
                                className="btn btn-ghost"
                                style={{ padding: '4px 8px' }}
                                onClick={() => toggleConfig(config.id)}
                            >
                                {config.isEnabled ? (
                                    <>
                                        <ToggleRight size={20} color="var(--color-success)" />
                                        <span className="text-sm" style={{ color: 'var(--color-success)' }}>Enabled</span>
                                    </>
                                ) : (
                                    <>
                                        <ToggleLeft size={20} />
                                        <span className="text-sm text-muted">Disabled</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredConfigs.length === 0 && (
                <div className="card">
                    <div className="empty-state">
                        <FileSignature />
                        <div className="empty-state-title">No configurations found</div>
                        <div className="empty-state-description">
                            {searchQuery ? 'Try a different search term' : 'Create your first signing configuration'}
                        </div>
                        {!searchQuery && (
                            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                                <Plus size={18} />
                                Create Configuration
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create Signing Configuration</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateConfig}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Configuration Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., Windows EXE Signing"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Brief description of this configuration"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">PKCS#11 Key</label>
                                        <select
                                            className="form-input form-select"
                                            value={formData.keyId}
                                            onChange={(e) => setFormData({ ...formData, keyId: e.target.value })}
                                            required
                                        >
                                            {keys.map(key => (
                                                <option key={key.id} value={key.id}>
                                                    {key.name} ({key.algorithm})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Hash Algorithm</label>
                                        <select
                                            className="form-input form-select"
                                            value={formData.hashAlgorithm}
                                            onChange={(e) => setFormData({ ...formData, hashAlgorithm: e.target.value as HashAlgorithm })}
                                        >
                                            <option value="SHA-256">SHA-256</option>
                                            <option value="SHA-384">SHA-384</option>
                                            <option value="SHA-512">SHA-512</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Timestamp Authority URL (Optional)</label>
                                    <input
                                        type="url"
                                        className="form-input"
                                        placeholder="http://timestamp.digicert.com"
                                        value={formData.timestampUrl}
                                        onChange={(e) => setFormData({ ...formData, timestampUrl: e.target.value })}
                                    />
                                    <div className="text-muted text-sm" style={{ marginTop: '4px' }}>
                                        Adds a trusted timestamp to signed artifacts
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
