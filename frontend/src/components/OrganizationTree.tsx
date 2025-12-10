import { useState, useMemo } from 'react';
import {
    Building2,
    ChevronRight,
    ChevronDown,
    Users,
    Key,
    Plus,
    MoreHorizontal,
    Search
} from 'lucide-react';

interface OrganizationNode {
    id: string;
    name: string;
    slug: string;
    status: 'active' | 'pending' | 'inactive';
    parentId: string | null;
    usersCount: number;
    keysCount: number;
    children: OrganizationNode[];
}

interface OrganizationTreeProps {
    organizations: OrganizationNode[];
    onSelect?: (org: OrganizationNode) => void;
    onAddChild?: (parentId: string) => void;
}

// Mock data for demonstration
const mockOrganizations: OrganizationNode[] = [
    {
        id: '1',
        name: 'Global Corp',
        slug: 'global-corp',
        status: 'active',
        parentId: null,
        usersCount: 45,
        keysCount: 12,
        children: [
            {
                id: '2',
                name: 'North America',
                slug: 'north-america',
                status: 'active',
                parentId: '1',
                usersCount: 20,
                keysCount: 5,
                children: [
                    {
                        id: '4',
                        name: 'USA Division',
                        slug: 'usa-division',
                        status: 'active',
                        parentId: '2',
                        usersCount: 12,
                        keysCount: 3,
                        children: []
                    },
                    {
                        id: '5',
                        name: 'Canada Division',
                        slug: 'canada-division',
                        status: 'active',
                        parentId: '2',
                        usersCount: 8,
                        keysCount: 2,
                        children: []
                    }
                ]
            },
            {
                id: '3',
                name: 'Europe',
                slug: 'europe',
                status: 'active',
                parentId: '1',
                usersCount: 25,
                keysCount: 7,
                children: [
                    {
                        id: '6',
                        name: 'Germany Office',
                        slug: 'germany-office',
                        status: 'active',
                        parentId: '3',
                        usersCount: 15,
                        keysCount: 4,
                        children: []
                    },
                    {
                        id: '7',
                        name: 'UK Office',
                        slug: 'uk-office',
                        status: 'pending',
                        parentId: '3',
                        usersCount: 10,
                        keysCount: 3,
                        children: []
                    }
                ]
            }
        ]
    },
    {
        id: '8',
        name: 'Startup Inc',
        slug: 'startup-inc',
        status: 'active',
        parentId: null,
        usersCount: 8,
        keysCount: 2,
        children: []
    }
];

function TreeNode({
    node,
    level = 0,
    onSelect,
    onAddChild,
    selectedId
}: {
    node: OrganizationNode;
    level?: number;
    onSelect?: (org: OrganizationNode) => void;
    onAddChild?: (parentId: string) => void;
    selectedId?: string;
}) {
    const [isExpanded, setIsExpanded] = useState(level < 2);
    const hasChildren = node.children.length > 0;
    const isSelected = selectedId === node.id;

    const statusColors: Record<string, string> = {
        active: 'var(--color-success)',
        pending: 'var(--color-warning)',
        inactive: 'var(--color-error)'
    };

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    paddingLeft: `calc(var(--spacing-md) + ${level * 24}px)`,
                    background: isSelected ? 'var(--color-accent-subtle)' : 'transparent',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                    gap: 'var(--spacing-sm)'
                }}
                onClick={() => onSelect?.(node)}
                onMouseEnter={(e) => {
                    if (!isSelected) {
                        e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isSelected) {
                        e.currentTarget.style.background = 'transparent';
                    }
                }}
            >
                {/* Expand/Collapse */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    style={{
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'none',
                        border: 'none',
                        cursor: hasChildren ? 'pointer' : 'default',
                        opacity: hasChildren ? 1 : 0.3,
                        color: 'var(--color-text-secondary)'
                    }}
                    disabled={!hasChildren}
                >
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>

                {/* Icon */}
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <Building2 size={18} style={{ color: 'var(--color-accent-primary)' }} />
                </div>

                {/* Name & Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)'
                    }}>
                        <span style={{
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {node.name}
                        </span>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: 'var(--radius-full)',
                            background: statusColors[node.status],
                            flexShrink: 0
                        }} />
                    </div>
                    <div className="text-sm text-muted" style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <span className="flex items-center gap-xs">
                            <Users size={12} /> {node.usersCount}
                        </span>
                        <span className="flex items-center gap-xs">
                            <Key size={12} /> {node.keysCount}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                    <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddChild?.(node.id);
                        }}
                        title="Add child organization"
                    >
                        <Plus size={14} />
                    </button>
                    <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={(e) => e.stopPropagation()}
                        title="More options"
                    >
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </div>

            {/* Children */}
            {isExpanded && hasChildren && (
                <div>
                    {node.children.map(child => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            onSelect={onSelect}
                            onAddChild={onAddChild}
                            selectedId={selectedId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function OrganizationTree({
    organizations = mockOrganizations,
    onSelect,
    onAddChild
}: OrganizationTreeProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedId, setSelectedId] = useState<string | undefined>();

    // Flatten tree for search
    const flattenTree = (nodes: OrganizationNode[]): OrganizationNode[] => {
        return nodes.reduce((acc: OrganizationNode[], node) => {
            acc.push(node);
            if (node.children.length > 0) {
                acc.push(...flattenTree(node.children));
            }
            return acc;
        }, []);
    };

    const allOrgs = useMemo(() => flattenTree(organizations), [organizations]);

    const filteredOrgs = useMemo(() => {
        if (!searchQuery) return organizations;
        const query = searchQuery.toLowerCase();
        return allOrgs.filter(org =>
            org.name.toLowerCase().includes(query) ||
            org.slug.toLowerCase().includes(query)
        );
    }, [searchQuery, allOrgs, organizations]);

    const handleSelect = (org: OrganizationNode) => {
        setSelectedId(org.id);
        onSelect?.(org);
    };

    // Stats
    const totalOrgs = allOrgs.length;
    const activeOrgs = allOrgs.filter(o => o.status === 'active').length;
    const totalUsers = allOrgs.reduce((sum, o) => sum + o.usersCount, 0);
    const totalKeys = allOrgs.reduce((sum, o) => sum + o.keysCount, 0);

    return (
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <div>
                    <h3 className="card-title">Organization Hierarchy</h3>
                    <p className="card-subtitle">
                        {totalOrgs} organizations • {activeOrgs} active
                    </p>
                </div>
                <button className="btn btn-primary btn-sm">
                    <Plus size={16} />
                    Add Root
                </button>
            </div>

            {/* Search */}
            <div style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ position: 'relative' }}>
                    <Search
                        size={18}
                        style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-muted)'
                        }}
                    />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search organizations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '40px' }}
                    />
                </div>
            </div>

            {/* Stats Summary */}
            <div style={{
                padding: 'var(--spacing-sm) var(--spacing-md)',
                display: 'flex',
                gap: 'var(--spacing-lg)',
                borderBottom: '1px solid var(--color-border)',
                background: 'var(--color-bg-secondary)'
            }}>
                <div className="text-sm">
                    <span className="text-muted">Total Users:</span>{' '}
                    <strong>{totalUsers}</strong>
                </div>
                <div className="text-sm">
                    <span className="text-muted">Total Keys:</span>{' '}
                    <strong>{totalKeys}</strong>
                </div>
            </div>

            {/* Tree */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-sm) 0' }}>
                {searchQuery ? (
                    // Flat search results
                    filteredOrgs.map(org => (
                        <TreeNode
                            key={org.id}
                            node={{ ...org, children: [] }}
                            level={0}
                            onSelect={handleSelect}
                            onAddChild={onAddChild}
                            selectedId={selectedId}
                        />
                    ))
                ) : (
                    // Hierarchical tree
                    organizations.map(org => (
                        <TreeNode
                            key={org.id}
                            node={org}
                            level={0}
                            onSelect={handleSelect}
                            onAddChild={onAddChild}
                            selectedId={selectedId}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default OrganizationTree;
