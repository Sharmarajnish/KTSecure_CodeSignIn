import { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    MoreVertical,
    Building2,
    Users,
    Key,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
    Check,
    XCircle
} from 'lucide-react';
import type { Organization } from '../types';
import { api } from '../services/api';

export default function Organizations() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        adminEmail: ''
    });

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const data = await api.getOrganizations();
                setOrganizations(data);
            } finally {
                setLoading(false);
            }
        };
        fetchOrganizations();
    }, []);

    const filteredOrgs = organizations.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: Organization['status']) => {
        switch (status) {
            case 'active':
                return <span className="badge badge-success"><CheckCircle2 size={12} />Active</span>;
            case 'pending':
                return <span className="badge badge-warning"><Clock size={12} />Pending</span>;
            case 'inactive':
                return <span className="badge badge-error"><AlertCircle size={12} />Inactive</span>;
        }
    };

    const handleCreateOrganization = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newOrg = await api.createOrganization(formData);
            setOrganizations([...organizations, newOrg]);
            setShowCreateModal(false);
            setFormData({ name: '', slug: '', adminEmail: '' });
        } catch (error) {
            console.error('Failed to create organization:', error);
        }
    };

    const handleApproveOrganization = async (orgId: string) => {
        try {
            const updatedOrg = await api.approveOrganization(orgId);
            setOrganizations(orgs =>
                orgs.map(org => org.id === orgId ? updatedOrg : org)
            );
        } catch (error) {
            console.error('Failed to approve organization:', error);
        }
    };

    const handleRejectOrganization = async (orgId: string) => {
        try {
            const updatedOrg = await api.rejectOrganization(orgId);
            setOrganizations(orgs =>
                orgs.map(org => org.id === orgId ? updatedOrg : org)
            );
        } catch (error) {
            console.error('Failed to reject organization:', error);
        }
    };

    const handleNameChange = (name: string) => {
        setFormData({
            ...formData,
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ height: '50vh' }}>
                <div className="animate-pulse text-muted">Loading organizations...</div>
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
                            placeholder="Search organizations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        <Plus size={18} />
                        Create Organization
                    </button>
                </div>
            </div>

            {/* Organizations Table */}
            <div className="card" style={{ padding: 0 }}>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Organization</th>
                                <th>Slug</th>
                                <th>Status</th>
                                <th>Users</th>
                                <th>Keys</th>
                                <th>Created</th>
                                <th style={{ width: '60px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrgs.map((org) => (
                                <tr key={org.id}>
                                    <td>
                                        <div className="flex items-center gap-md">
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: 'var(--radius-md)',
                                                background: 'var(--color-accent-gradient)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                fontSize: '1rem'
                                            }}>
                                                {org.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{org.name}</div>
                                                <div className="text-muted text-sm">{org.adminEmail}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <code className="font-mono text-sm" style={{
                                            background: 'var(--color-bg-tertiary)',
                                            padding: '2px 8px',
                                            borderRadius: 'var(--radius-sm)'
                                        }}>
                                            {org.slug}
                                        </code>
                                    </td>
                                    <td>{getStatusBadge(org.status)}</td>
                                    <td>
                                        <div className="flex items-center gap-sm">
                                            <Users size={16} className="text-muted" />
                                            {org.usersCount}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-sm">
                                            <Key size={16} className="text-muted" />
                                            {org.keysCount}
                                        </div>
                                    </td>
                                    <td className="text-muted text-sm">
                                        {new Date(org.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-sm">
                                            {org.status === 'pending' && (
                                                <>
                                                    <button
                                                        className="btn btn-ghost btn-icon"
                                                        style={{ color: 'var(--color-success)' }}
                                                        onClick={() => handleApproveOrganization(org.id)}
                                                        title="Approve"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-icon"
                                                        style={{ color: 'var(--color-error)' }}
                                                        onClick={() => handleRejectOrganization(org.id)}
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <button className="btn btn-ghost btn-icon">
                                                <MoreVertical size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredOrgs.length === 0 && (
                    <div className="empty-state">
                        <Building2 />
                        <div className="empty-state-title">No organizations found</div>
                        <div className="empty-state-description">
                            {searchQuery ? 'Try a different search term' : 'Create your first organization to get started'}
                        </div>
                        {!searchQuery && (
                            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                                <Plus size={18} />
                                Create Organization
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
                            <h2 className="modal-title">Create Organization</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateOrganization}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Organization Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., Acme Corporation"
                                        value={formData.name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Slug</label>
                                    <input
                                        type="text"
                                        className="form-input font-mono"
                                        placeholder="acme-corporation"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        required
                                    />
                                    <div className="text-muted text-sm" style={{ marginTop: '4px' }}>
                                        Used in URLs and API references
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Admin Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="admin@example.com"
                                        value={formData.adminEmail}
                                        onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Organization
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
