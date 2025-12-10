import { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    MoreVertical,
    Cpu,
    Users,
    FileSignature,
    CheckCircle2,
    Archive,
    Car,
    Radio,
    Zap,
    Network,
    Box,
    X
} from 'lucide-react';
import type { Project, Organization, User, SigningConfig } from '../types';
import { api } from '../services/api';

const ecuTypeIcons: Record<string, React.ReactNode> = {
    ADAS: <Car size={20} />,
    Powertrain: <Zap size={20} />,
    Body: <Box size={20} />,
    Infotainment: <Radio size={20} />,
    Gateway: <Network size={20} />,
    Other: <Cpu size={20} />
};

const ecuTypeColors: Record<string, string> = {
    ADAS: '#3b82f6',
    Powertrain: '#f59e0b',
    Body: '#10b981',
    Infotainment: '#8b5cf6',
    Gateway: '#06b6d4',
    Other: '#6b7280'
};

export default function Projects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [configs, setConfigs] = useState<SigningConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        ecuType: 'Other' as Project['ecuType'],
        organizationId: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsData, orgsData, usersData, configsData] = await Promise.all([
                    api.getProjects(),
                    api.getOrganizations(),
                    api.getUsers(),
                    api.getSigningConfigs()
                ]);
                setProjects(projectsData);
                setOrganizations(orgsData);
                setUsers(usersData);
                setConfigs(configsData);
                if (orgsData.length > 0) {
                    setFormData(prev => ({ ...prev, organizationId: orgsData[0].id }));
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getLinkedUsers = (userIds: string[]) => {
        return users.filter(u => userIds.includes(u.id));
    };

    const getLinkedConfigs = (configIds: string[]) => {
        return configs.filter(c => configIds.includes(c.id));
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newProject = await api.createProject(formData);
            setProjects([...projects, newProject]);
            setShowCreateModal(false);
            setFormData({ name: '', description: '', ecuType: 'Other', organizationId: organizations[0]?.id || '' });
        } catch (error) {
            console.error('Failed to create project:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ height: '50vh' }}>
                <div className="animate-pulse text-muted">Loading projects...</div>
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
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        <Plus size={18} />
                        Create Project
                    </button>
                </div>
            </div>

            {/* Projects Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 'var(--spacing-lg)' }}>
                {filteredProjects.map((project) => {
                    const linkedUsers = getLinkedUsers(project.linkedUserIds);
                    const linkedConfigs = getLinkedConfigs(project.linkedConfigIds);

                    return (
                        <div key={project.id} className="card" style={{
                            position: 'relative',
                            borderTop: `4px solid ${ecuTypeColors[project.ecuType]}`
                        }}>
                            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-md)' }}>
                                <div className="flex items-center gap-md">
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: 'var(--radius-md)',
                                        background: `${ecuTypeColors[project.ecuType]}20`,
                                        color: ecuTypeColors[project.ecuType],
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {ecuTypeIcons[project.ecuType]}
                                    </div>
                                    <div>
                                        <h3 style={{ fontWeight: 600, fontSize: '1.1rem' }}>{project.name}</h3>
                                        <div className="flex items-center gap-sm text-muted text-sm">
                                            <span className="badge" style={{
                                                background: `${ecuTypeColors[project.ecuType]}20`,
                                                color: ecuTypeColors[project.ecuType]
                                            }}>
                                                {project.ecuType}
                                            </span>
                                            <span>•</span>
                                            <span>{project.organizationName}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-icon">
                                    <MoreVertical size={18} />
                                </button>
                            </div>

                            <p className="text-muted text-sm" style={{ marginBottom: 'var(--spacing-md)' }}>
                                {project.description}
                            </p>

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
                                        <Users size={14} />
                                        Linked Users
                                    </div>
                                    <div style={{ marginTop: '4px' }}>
                                        {linkedUsers.length > 0 ? (
                                            <div className="flex" style={{ gap: '-8px' }}>
                                                {linkedUsers.slice(0, 3).map((user, i) => (
                                                    <div key={user.id} style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: 'var(--radius-full)',
                                                        background: 'var(--color-accent-gradient)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                        border: '2px solid var(--color-bg-secondary)',
                                                        marginLeft: i > 0 ? '-8px' : 0,
                                                        zIndex: 3 - i
                                                    }}>
                                                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                    </div>
                                                ))}
                                                {linkedUsers.length > 3 && (
                                                    <div style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: 'var(--radius-full)',
                                                        background: 'var(--color-bg-tertiary)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                        marginLeft: '-8px'
                                                    }}>
                                                        +{linkedUsers.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted text-sm">None</span>
                                        )}
                                    </div>
                                </div>

                                <div style={{
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: 'var(--spacing-sm) var(--spacing-md)'
                                }}>
                                    <div className="flex items-center gap-sm text-muted text-sm">
                                        <FileSignature size={14} />
                                        Signing Configs
                                    </div>
                                    <div style={{ fontWeight: 500, marginTop: '4px' }}>
                                        {linkedConfigs.length > 0 ? (
                                            linkedConfigs.map(c => c.name).join(', ').substring(0, 30) + (linkedConfigs.length > 1 ? '...' : '')
                                        ) : (
                                            <span className="text-muted">None</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between" style={{
                                paddingTop: 'var(--spacing-md)',
                                borderTop: '1px solid var(--color-border)'
                            }}>
                                <span className="text-sm text-muted">
                                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                                </span>
                                {project.status === 'active' ? (
                                    <span className="badge badge-success"><CheckCircle2 size={12} />Active</span>
                                ) : (
                                    <span className="badge" style={{ background: 'rgba(107, 114, 128, 0.15)', color: 'var(--color-text-muted)' }}>
                                        <Archive size={12} />Archived
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredProjects.length === 0 && (
                <div className="card">
                    <div className="empty-state">
                        <Cpu />
                        <div className="empty-state-title">No projects found</div>
                        <div className="empty-state-description">
                            {searchQuery ? 'Try a different search term' : 'Create your first project/ECU'}
                        </div>
                        {!searchQuery && (
                            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                                <Plus size={18} />
                                Create Project
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create Project / ECU</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateProject}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Project Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., ADAS Controller v3"
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
                                        placeholder="Brief description of this project"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid-2">
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
                                        <label className="form-label">ECU Type</label>
                                        <select
                                            className="form-input form-select"
                                            value={formData.ecuType}
                                            onChange={(e) => setFormData({ ...formData, ecuType: e.target.value as Project['ecuType'] })}
                                        >
                                            <option value="ADAS">ADAS</option>
                                            <option value="Powertrain">Powertrain</option>
                                            <option value="Body">Body Control</option>
                                            <option value="Infotainment">Infotainment</option>
                                            <option value="Gateway">Gateway</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
