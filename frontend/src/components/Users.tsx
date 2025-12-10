import { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    MoreVertical,
    UserPlus,
    CheckCircle2,
    Clock,
    XCircle,
    Shield,
    Eye,
    Settings,
    X
} from 'lucide-react';
import type { User, Organization } from '../types';
import { api } from '../services/api';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'viewer' as User['role'],
        organizationId: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersData, orgsData] = await Promise.all([
                    api.getUsers(),
                    api.getOrganizations()
                ]);
                setUsers(usersData);
                setOrganizations(orgsData);
                if (orgsData.length > 0 && !formData.organizationId) {
                    setFormData(prev => ({ ...prev, organizationId: orgsData[0].id }));
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getOrgName = (orgId: string) => {
        return organizations.find(o => o.id === orgId)?.name || 'Unknown';
    };

    const getStatusBadge = (status: User['status']) => {
        switch (status) {
            case 'active':
                return <span className="badge badge-success"><CheckCircle2 size={12} />Active</span>;
            case 'invited':
                return <span className="badge badge-warning"><Clock size={12} />Invited</span>;
            case 'disabled':
                return <span className="badge badge-error"><XCircle size={12} />Disabled</span>;
        }
    };

    const getRoleBadge = (role: User['role']) => {
        switch (role) {
            case 'admin':
                return <span className="badge badge-primary"><Shield size={12} />Admin</span>;
            case 'operator':
                return <span className="badge badge-info"><Settings size={12} />Operator</span>;
            case 'viewer':
                return <span className="badge" style={{ background: 'rgba(107, 114, 128, 0.15)', color: 'var(--color-text-muted)' }}><Eye size={12} />Viewer</span>;
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newUser = await api.createUser(formData);
            setUsers([...users, newUser]);
            setShowCreateModal(false);
            setFormData({ name: '', email: '', role: 'viewer', organizationId: organizations[0]?.id || '' });
        } catch (error) {
            console.error('Failed to create user:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ height: '50vh' }}>
                <div className="animate-pulse text-muted">Loading users...</div>
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
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        <Plus size={18} />
                        Invite User
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="card" style={{ padding: 0 }}>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Organization</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last Login</th>
                                <th style={{ width: '60px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="flex items-center gap-md">
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: 'var(--radius-full)',
                                                background: 'var(--color-bg-tertiary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 600,
                                                fontSize: '0.9rem',
                                                color: 'var(--color-accent-primary)'
                                            }}>
                                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{user.name}</div>
                                                <div className="text-muted text-sm">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            background: 'var(--color-bg-tertiary)',
                                            padding: '4px 12px',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.85rem'
                                        }}>
                                            {getOrgName(user.organizationId)}
                                        </span>
                                    </td>
                                    <td>{getRoleBadge(user.role)}</td>
                                    <td>{getStatusBadge(user.status)}</td>
                                    <td className="text-muted text-sm">
                                        {user.lastLogin
                                            ? new Date(user.lastLogin).toLocaleString()
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

                {filteredUsers.length === 0 && (
                    <div className="empty-state">
                        <UserPlus />
                        <div className="empty-state-title">No users found</div>
                        <div className="empty-state-description">
                            {searchQuery ? 'Try a different search term' : 'Invite users to get started'}
                        </div>
                        {!searchQuery && (
                            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                                <Plus size={18} />
                                Invite User
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
                            <h2 className="modal-title">Invite User</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Organization</label>
                                    <select
                                        className="form-input form-select"
                                        value={formData.organizationId}
                                        onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
                                        required
                                    >
                                        {organizations.map(org => (
                                            <option key={org.id} value={org.id}>{org.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Role</label>
                                    <select
                                        className="form-input form-select"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
                                    >
                                        <option value="admin">Admin - Full access</option>
                                        <option value="operator">Operator - Manage keys & configs</option>
                                        <option value="viewer">Viewer - Read-only access</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Send Invitation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
