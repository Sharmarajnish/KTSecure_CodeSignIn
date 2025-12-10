import { useState } from 'react';
import {
    Book,
    ChevronRight,
    Building2,
    Users,
    Key,
    FileSignature,
    Shield,
    Settings,
    AlertTriangle,
    CheckCircle,
    Info,
    Cpu,
    Lock,
    RefreshCw,
    FileCheck
} from 'lucide-react';

interface DocSection {
    id: string;
    title: string;
    icon: React.ReactNode;
    content: React.ReactNode;
}

export default function Documentation() {
    const [activeSection, setActiveSection] = useState('overview');

    const sections: DocSection[] = [
        {
            id: 'overview',
            title: 'System Overview',
            icon: <Book size={18} />,
            content: (
                <div>
                    <h2 style={{ marginBottom: 'var(--spacing-md)' }}>KT Secure HSM Code Signing Platform</h2>
                    <p className="text-secondary" style={{ marginBottom: 'var(--spacing-lg)', lineHeight: 1.8 }}>
                        The KT Secure platform provides enterprise-grade Hardware Security Module (HSM) management
                        and code signing infrastructure. This system manages cryptographic keys, signing configurations,
                        and organizational hierarchies for secure code signing operations.
                    </p>

                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Core Components</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
                            <div className="flex items-center gap-sm">
                                <Building2 size={20} style={{ color: 'var(--color-accent-primary)' }} />
                                <span><strong>Organizations</strong> - Hierarchical tenant management</span>
                            </div>
                            <div className="flex items-center gap-sm">
                                <Users size={20} style={{ color: 'var(--color-crypto)' }} />
                                <span><strong>Users</strong> - Role-based access control</span>
                            </div>
                            <div className="flex items-center gap-sm">
                                <Key size={20} style={{ color: 'var(--color-success)' }} />
                                <span><strong>PKCS#11 Keys</strong> - HSM-protected cryptographic keys</span>
                            </div>
                            <div className="flex items-center gap-sm">
                                <FileSignature size={20} style={{ color: 'var(--color-warning)' }} />
                                <span><strong>Signing Configs</strong> - Algorithm and encoding settings</span>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ background: 'var(--color-accent-subtle)' }}>
                        <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
                            <Info size={18} style={{ color: 'var(--color-accent-primary)' }} />
                            <strong>Security Note</strong>
                        </div>
                        <p className="text-secondary">
                            All cryptographic operations are performed within FIPS 140-2 Level 3 certified
                            Hardware Security Modules. Private keys never leave the HSM boundary.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'organizations',
            title: 'Organization Management',
            icon: <Building2 size={18} />,
            content: (
                <div>
                    <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Organization Management</h2>
                    <p className="text-secondary" style={{ marginBottom: 'var(--spacing-lg)', lineHeight: 1.8 }}>
                        Organizations form the hierarchical structure of the platform. Each cryptographic asset
                        and user is scoped within an Organization, which may be nested within a Parent Organization.
                    </p>

                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Create Organization Workflow</h3>
                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <ol style={{ marginLeft: 'var(--spacing-lg)', lineHeight: 2 }}>
                            <li>Enter organization name (must be unique)</li>
                            <li>Select parent organization (optional)</li>
                            <li>Choose organization type (Tenant, Department, Project)</li>
                            <li>Set active status</li>
                            <li>System validates and creates organization</li>
                            <li>Audit trail is automatically generated</li>
                        </ol>
                    </div>

                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Update Organization</h3>
                    <div className="card" style={{ background: 'var(--color-warning)', color: 'white', padding: 'var(--spacing-md)' }}>
                        <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
                            <AlertTriangle size={18} />
                            <strong>Circular Dependency Prevention</strong>
                        </div>
                        <p>
                            When moving an organization in the hierarchy, the system checks for circular references.
                            You cannot move Org A under Org B if Org B is already a child of Org A.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'users',
            title: 'User Management',
            icon: <Users size={18} />,
            content: (
                <div>
                    <h2 style={{ marginBottom: 'var(--spacing-md)' }}>User Management & Roles</h2>
                    <p className="text-secondary" style={{ marginBottom: 'var(--spacing-lg)', lineHeight: 1.8 }}>
                        The platform implements a 4-level role-based access control system with Azure AD synchronization.
                    </p>

                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>User Roles</h3>
                    <div style={{ display: 'grid', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                        <div className="card">
                            <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
                                <Shield size={20} style={{ color: 'var(--color-brand)' }} />
                                <strong>KTSecure Admin</strong>
                            </div>
                            <p className="text-secondary">
                                System-wide orchestration. Creates Organization Tenants, manages system health,
                                HSM status, and global audit logs.
                            </p>
                        </div>
                        <div className="card">
                            <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
                                <Building2 size={20} style={{ color: 'var(--color-accent-primary)' }} />
                                <strong>Organization Admin</strong>
                            </div>
                            <p className="text-secondary">
                                Manages a specific tenant. Creates users within their organization,
                                manages projects (ECU). Cannot see other tenants.
                            </p>
                        </div>
                        <div className="card">
                            <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
                                <Key size={20} style={{ color: 'var(--color-crypto)' }} />
                                <strong>Crypto Admin</strong>
                            </div>
                            <p className="text-secondary">
                                Technical cryptographic management. Creates PKCS#11 keys, Signing Configurations,
                                manages key lifecycle (rotation/destruction).
                            </p>
                        </div>
                        <div className="card">
                            <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
                                <FileCheck size={20} style={{ color: 'var(--color-success)' }} />
                                <strong>Crypto User</strong>
                            </div>
                            <p className="text-secondary">
                                Consumer of services. Performs Sign, XML Sign, and creates CSR/Certificate requests.
                                Simplified interface with minimized technical complexity.
                            </p>
                        </div>
                    </div>

                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Azure AD Synchronization</h3>
                    <div className="card">
                        <p className="text-secondary" style={{ marginBottom: 'var(--spacing-md)' }}>
                            Users are synchronized with Azure Active Directory:
                        </p>
                        <ul style={{ marginLeft: 'var(--spacing-lg)', lineHeight: 2 }}>
                            <li><strong>User in DB:</strong> Updates Azure AccountEnabled flag and syncs GUIDs</li>
                            <li><strong>User not in DB but in Azure:</strong> Creates local user mapped to Azure identity</li>
                            <li><strong>User not in Azure:</strong> Attempts to create user in Azure</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'keys',
            title: 'PKCS#11 Key Management',
            icon: <Key size={18} />,
            content: (
                <div>
                    <h2 style={{ marginBottom: 'var(--spacing-md)' }}>PKCS#11 Key Generation</h2>
                    <p className="text-secondary" style={{ marginBottom: 'var(--spacing-lg)', lineHeight: 1.8 }}>
                        The Key Ceremony Wizard guides you through creating cryptographic keys in the HSM.
                    </p>

                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Supported Algorithms</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                        <div className="card">
                            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>RSA Keys</h4>
                            <ul style={{ marginLeft: 'var(--spacing-lg)', lineHeight: 1.8 }}>
                                <li>RSA-2048 (minimum recommended)</li>
                                <li>RSA-3072</li>
                                <li>RSA-4096 (strongest)</li>
                            </ul>
                        </div>
                        <div className="card">
                            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Elliptic Curve (EC)</h4>
                            <ul style={{ marginLeft: 'var(--spacing-lg)', lineHeight: 1.8 }}>
                                <li>ECDSA P-256</li>
                                <li>ECDSA P-384</li>
                                <li>ECDSA P-521</li>
                            </ul>
                        </div>
                    </div>

                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Key Usage Flags</h3>
                    <div className="card">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)' }}>
                            <div className="flex items-center gap-sm">
                                <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
                                <span>Sign</span>
                            </div>
                            <div className="flex items-center gap-sm">
                                <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
                                <span>Verify</span>
                            </div>
                            <div className="flex items-center gap-sm">
                                <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
                                <span>Encrypt</span>
                            </div>
                            <div className="flex items-center gap-sm">
                                <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
                                <span>Decrypt</span>
                            </div>
                            <div className="flex items-center gap-sm">
                                <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
                                <span>Wrap</span>
                            </div>
                            <div className="flex items-center gap-sm">
                                <CheckCircle size={16} style={{ color: 'var(--color-success)' }} />
                                <span>Unwrap</span>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ marginTop: 'var(--spacing-lg)', background: 'var(--color-brand-bg)' }}>
                        <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
                            <Lock size={18} style={{ color: 'var(--color-brand)' }} />
                            <strong>HSM Security</strong>
                        </div>
                        <p className="text-secondary">
                            Keys are generated and stored exclusively within the HSM. Private key material
                            never leaves the secure hardware boundary.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'signing',
            title: 'Signing Operations',
            icon: <FileSignature size={18} />,
            content: (
                <div>
                    <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Signing Configuration & Operations</h2>
                    <p className="text-secondary" style={{ marginBottom: 'var(--spacing-lg)', lineHeight: 1.8 }}>
                        Signing configurations define how code signing operations are performed.
                    </p>

                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Configuration Options</h3>
                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)' }}>Parameter</th>
                                    <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)' }}>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: 'var(--spacing-sm)' }}>Signing Algorithm</td>
                                    <td style={{ padding: 'var(--spacing-sm)' }}>SHA256withRSA, SHA384withRSA, SHA512withRSA, etc.</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: 'var(--spacing-sm)' }}>Digest Encoding</td>
                                    <td style={{ padding: 'var(--spacing-sm)' }}>Base64, Hex, Raw</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: 'var(--spacing-sm)' }}>Signature Encoding</td>
                                    <td style={{ padding: 'var(--spacing-sm)' }}>PKCS1, PSS, DER</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: 'var(--spacing-sm)' }}>Timestamp Authority</td>
                                    <td style={{ padding: 'var(--spacing-sm)' }}>RFC 3161 timestamp server URL</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Supported Signing Types</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
                        <div className="card">
                            <h4>Code Signing</h4>
                            <ul style={{ marginLeft: 'var(--spacing-lg)', marginTop: 'var(--spacing-sm)' }}>
                                <li>Windows PE (.exe, .dll)</li>
                                <li>macOS bundles</li>
                                <li>Firmware images</li>
                            </ul>
                        </div>
                        <div className="card">
                            <h4>Document Signing</h4>
                            <ul style={{ marginLeft: 'var(--spacing-lg)', marginTop: 'var(--spacing-sm)' }}>
                                <li>XML signatures (XAdES)</li>
                                <li>PDF documents</li>
                                <li>CSR generation</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'projects',
            title: 'Projects & ECUs',
            icon: <Cpu size={18} />,
            content: (
                <div>
                    <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Projects / ECU Management</h2>
                    <p className="text-secondary" style={{ marginBottom: 'var(--spacing-lg)', lineHeight: 1.8 }}>
                        Projects represent Electronic Control Units (ECUs) that require code signing for secure firmware updates.
                    </p>

                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>ECU Types</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                        {['ADAS', 'Powertrain', 'Body Control', 'Gateway', 'Infotainment', 'Safety'].map(type => (
                            <div key={type} className="card" style={{ textAlign: 'center' }}>
                                <Cpu size={24} style={{ color: 'var(--color-accent-primary)', marginBottom: 'var(--spacing-sm)' }} />
                                <div style={{ fontWeight: 600 }}>{type}</div>
                            </div>
                        ))}
                    </div>

                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Project Configuration</h3>
                    <div className="card">
                        <ul style={{ marginLeft: 'var(--spacing-lg)', lineHeight: 2 }}>
                            <li><strong>Name:</strong> Unique project identifier</li>
                            <li><strong>ECU Type:</strong> Classification of the control unit</li>
                            <li><strong>Organization:</strong> Parent organization scope</li>
                            <li><strong>Linked Users:</strong> Team members with access</li>
                            <li><strong>Signing Configs:</strong> Associated signing profiles</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'audit',
            title: 'Audit & Compliance',
            icon: <RefreshCw size={18} />,
            content: (
                <div>
                    <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Audit Trail & Compliance</h2>
                    <p className="text-secondary" style={{ marginBottom: 'var(--spacing-lg)', lineHeight: 1.8 }}>
                        Every operation in the system is logged with cryptographic integrity for compliance auditing.
                    </p>

                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Logged Events</h3>
                    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
                            <div>
                                <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Create Events</h4>
                                <ul style={{ marginLeft: 'var(--spacing-lg)', lineHeight: 1.8 }}>
                                    <li>Organization created</li>
                                    <li>User provisioned</li>
                                    <li>Key generated</li>
                                    <li>Config created</li>
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Operational Events</h4>
                                <ul style={{ marginLeft: 'var(--spacing-lg)', lineHeight: 1.8 }}>
                                    <li>Signing operation</li>
                                    <li>Key rotation</li>
                                    <li>Permission change</li>
                                    <li>Config modification</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Compliance Standards</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-md)' }}>
                        <div className="card">
                            <strong>SOC 2 Type II</strong>
                            <p className="text-secondary" style={{ marginTop: 'var(--spacing-sm)' }}>
                                Full audit trail with periodic access reviews
                            </p>
                        </div>
                        <div className="card">
                            <strong>ISO 27001</strong>
                            <p className="text-secondary" style={{ marginTop: 'var(--spacing-sm)' }}>
                                Information security management compliance
                            </p>
                        </div>
                        <div className="card">
                            <strong>FIPS 140-2</strong>
                            <p className="text-secondary" style={{ marginTop: 'var(--spacing-sm)' }}>
                                HSM cryptographic module certification
                            </p>
                        </div>
                        <div className="card">
                            <strong>Common Criteria</strong>
                            <p className="text-secondary" style={{ marginTop: 'var(--spacing-sm)' }}>
                                EAL4+ evaluated HSM components
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'api',
            title: 'API Reference',
            icon: <Settings size={18} />,
            content: (
                <div>
                    <h2 style={{ marginBottom: 'var(--spacing-md)' }}>API Reference</h2>
                    <p className="text-secondary" style={{ marginBottom: 'var(--spacing-lg)', lineHeight: 1.8 }}>
                        The KT Secure platform provides RESTful APIs for all operations.
                    </p>

                    <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Endpoints</h3>
                    <div className="card" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <strong style={{ color: 'var(--color-success)' }}>POST</strong> /api/organizations
                            <p className="text-muted">Create new organization</p>
                        </div>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <strong style={{ color: 'var(--color-crypto)' }}>GET</strong> /api/organizations/:id
                            <p className="text-muted">Get organization details</p>
                        </div>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <strong style={{ color: 'var(--color-warning)' }}>PATCH</strong> /api/organizations/:id
                            <p className="text-muted">Update organization</p>
                        </div>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <strong style={{ color: 'var(--color-success)' }}>POST</strong> /api/users
                            <p className="text-muted">Create user with Azure sync</p>
                        </div>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <strong style={{ color: 'var(--color-success)' }}>POST</strong> /api/keys/pkcs11
                            <p className="text-muted">Generate PKCS#11 key in HSM</p>
                        </div>
                        <div>
                            <strong style={{ color: 'var(--color-success)' }}>POST</strong> /api/signing/sign
                            <p className="text-muted">Perform signing operation</p>
                        </div>
                    </div>

                    <h3 style={{ marginTop: 'var(--spacing-lg)', marginBottom: 'var(--spacing-md)' }}>Error Codes</h3>
                    <div className="card">
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)' }}>Error</th>
                                    <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)' }}>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: 'var(--spacing-sm)', color: 'var(--color-error)' }}>ConflictError</td>
                                    <td style={{ padding: 'var(--spacing-sm)' }}>Resource already exists (duplicate name)</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: 'var(--spacing-sm)', color: 'var(--color-error)' }}>ForbiddenError</td>
                                    <td style={{ padding: 'var(--spacing-sm)' }}>Access denied or invalid parent reference</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: 'var(--spacing-sm)', color: 'var(--color-error)' }}>ValidationError</td>
                                    <td style={{ padding: 'var(--spacing-sm)' }}>Invalid parameter combination</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: 'var(--spacing-sm)', color: 'var(--color-error)' }}>Pkcs11Exception</td>
                                    <td style={{ padding: 'var(--spacing-sm)' }}>HSM hardware error</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div style={{ display: 'flex', gap: 'var(--spacing-xl)', minHeight: 'calc(100vh - 120px)' }}>
            {/* Sidebar Navigation */}
            <div style={{
                width: '250px',
                flexShrink: 0,
                position: 'sticky',
                top: 'var(--spacing-xl)',
                height: 'fit-content'
            }}>
                <div className="card" style={{ padding: 'var(--spacing-sm)' }}>
                    <div style={{
                        padding: 'var(--spacing-md)',
                        fontWeight: 600,
                        borderBottom: '1px solid var(--color-border)',
                        marginBottom: 'var(--spacing-sm)'
                    }}>
                        Documentation
                    </div>
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                background: activeSection === section.id ? 'var(--color-accent-subtle)' : 'transparent',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                color: activeSection === section.id ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontWeight: activeSection === section.id ? 600 : 400,
                                transition: 'all var(--transition-fast)'
                            }}
                        >
                            {section.icon}
                            <span style={{ flex: 1 }}>{section.title}</span>
                            {activeSection === section.id && <ChevronRight size={16} />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, maxWidth: '800px' }}>
                {sections.find(s => s.id === activeSection)?.content}
            </div>
        </div>
    );
}
