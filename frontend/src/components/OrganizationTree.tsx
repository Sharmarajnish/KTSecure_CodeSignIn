import { useState } from 'react';
import { ChevronRight, ChevronDown, Building2, Plus } from 'lucide-react';

interface OrgNode {
    id: string;
    name: string;
    slug: string;
    status: 'active' | 'inactive';
    children: OrgNode[];
    usersCount: number;
    keysCount: number;
}

// Mock hierarchical data
const mockOrgTree: OrgNode[] = [
    {
        id: '1',
        name: 'Acme Corporation',
        slug: 'acme-corp',
        status: 'active',
        usersCount: 45,
        keysCount: 12,
        children: [
            {
                id: '1-1',
                name: 'Acme Automotive',
                slug: 'acme-auto',
                status: 'active',
                usersCount: 18,
                keysCount: 6,
                children: [
                    {
                        id: '1-1-1',
                        name: 'Acme Firmware Team',
                        slug: 'acme-firmware',
                        status: 'active',
                        usersCount: 8,
                        keysCount: 4,
                        children: []
                    },
                    {
                        id: '1-1-2',
                        name: 'Acme ECU Division',
                        slug: 'acme-ecu',
                        status: 'active',
                        usersCount: 10,
                        keysCount: 2,
                        children: []
                    }
                ]
            },
            {
                id: '1-2',
                name: 'Acme Cloud Services',
                slug: 'acme-cloud',
                status: 'active',
                usersCount: 27,
                keysCount: 6,
                children: []
            }
        ]
    },
    {
        id: '2',
        name: 'SecureTech Ltd',
        slug: 'securetech',
        status: 'active',
        usersCount: 32,
        keysCount: 8,
        children: [
            {
                id: '2-1',
                name: 'SecureTech R&D',
                slug: 'securetech-rd',
                status: 'active',
                usersCount: 15,
                keysCount: 5,
                children: []
            }
        ]
    }
];

interface TreeNodeProps {
    node: OrgNode;
    level: number;
    onSelect: (node: OrgNode) => void;
    selectedId: string | null;
}

function TreeNode({ node, level, onSelect, selectedId }: TreeNodeProps) {
    const [expanded, setExpanded] = useState(level < 2);
    const hasChildren = node.children.length > 0;

    return (
        <div>
            <div
                onClick={() => onSelect(node)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-sm)',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    paddingLeft: `${level * 24 + 12}px`,
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    background: selectedId === node.id ? 'var(--color-accent-subtle)' : 'transparent',
                    borderLeft: selectedId === node.id ? '3px solid var(--color-accent-primary)' : '3px solid transparent',
                    transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                    if (selectedId !== node.id) {
                        e.currentTarget.style.background = 'var(--color-bg-hover)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (selectedId !== node.id) {
                        e.currentTarget.style.background = 'transparent';
                    }
                }}
            >
                {hasChildren ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            color: 'var(--color-text-muted)'
                        }}
                    >
                        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                ) : (
                    <span style={{ width: '20px' }} />
                )}

                <Building2 size={18} style={{ color: 'var(--color-accent-primary)' }} />

                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{node.name}</div>
                    <div className="text-xs text-muted">{node.slug}</div>
                </div>

                <span className={`badge badge-${node.status === 'active' ? 'success' : 'secondary'}`}>
                    {node.status}
                </span>

                <div className="text-xs text-muted" style={{ minWidth: '60px', textAlign: 'right' }}>
                    {node.usersCount} users
                </div>
            </div>

            {expanded && hasChildren && (
                <div>
                    {node.children.map(child => (
                        <TreeNode
                            key={child.id}
                            node={child}
                            level={level + 1}
                            onSelect={onSelect}
                            selectedId={selectedId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface OrganizationTreeProps {
    onSelectOrg?: (org: OrgNode) => void;
}

export function OrganizationTree({ onSelectOrg }: OrganizationTreeProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const handleSelect = (node: OrgNode) => {
        setSelectedId(node.id);
        onSelectOrg?.(node);
    };

    return (
        <div className="card" style={{ height: '100%' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Organization Hierarchy</h3>
                <button className="btn btn-primary btn-sm">
                    <Plus size={16} />
                    Add Organization
                </button>
            </div>
            <div style={{ padding: 'var(--spacing-sm) 0' }}>
                {mockOrgTree.map(node => (
                    <TreeNode
                        key={node.id}
                        node={node}
                        level={0}
                        onSelect={handleSelect}
                        selectedId={selectedId}
                    />
                ))}
            </div>
        </div>
    );
}
