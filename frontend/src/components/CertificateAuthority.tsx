import { useState } from 'react';
import { Shield, Plus, Download, RefreshCw, CheckCircle, AlertTriangle, Clock, ExternalLink, Server } from 'lucide-react';

interface Certificate {
    id: string;
    subject: string;
    issuer: string;
    serialNumber: string;
    validFrom: string;
    validTo: string;
    status: 'active' | 'revoked' | 'expired';
    keyId?: string;
}

// Mock CA providers
const caProviders = [
    { id: 'ejbca', name: 'EJBCA Enterprise', status: 'connected', url: 'https://ca.example.com/ejbca' },
    { id: 'msca', name: 'Microsoft CA', status: 'disconnected', url: '' },
];

// Mock certificates
const mockCertificates: Certificate[] = [
    {
        id: '1',
        subject: 'CN=Acme Code Signing, O=Acme Corp, C=US',
        issuer: 'CN=EJBCA Root CA, O=KT Secure, C=UK',
        serialNumber: 'A1:B2:C3:D4:E5:F6:78:90',
        validFrom: '2024-01-01T00:00:00Z',
        validTo: '2025-12-31T23:59:59Z',
        status: 'active',
        keyId: 'key-1'
    },
    {
        id: '2',
        subject: 'CN=SecureTech Signing, O=SecureTech, C=DE',
        issuer: 'CN=EJBCA Root CA, O=KT Secure, C=UK',
        serialNumber: 'B2:C3:D4:E5:F6:78:90:A1',
        validFrom: '2024-06-01T00:00:00Z',
        validTo: '2025-05-31T23:59:59Z',
        status: 'active',
        keyId: 'key-2'
    },
    {
        id: '3',
        subject: 'CN=Legacy Signing, O=OldCorp, C=US',
        issuer: 'CN=Microsoft Root CA',
        serialNumber: 'C3:D4:E5:F6:78:90:A1:B2',
        validFrom: '2022-01-01T00:00:00Z',
        validTo: '2023-12-31T23:59:59Z',
        status: 'expired'
    }
];

export default function CertificateAuthority() {
    const [certificates, setCertificates] = useState(mockCertificates);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [requestForm, setRequestForm] = useState({
        subject: '',
        keyId: '',
        caProvider: 'ejbca',
        validityDays: 365
    });

    const getStatusBadge = (status: Certificate['status']) => {
        switch (status) {
            case 'active':
                return <span className="badge badge-success"><CheckCircle size={12} /> Active</span>;
            case 'expired':
                return <span className="badge badge-error"><AlertTriangle size={12} /> Expired</span>;
            case 'revoked':
                return <span className="badge badge-warning"><Clock size={12} /> Revoked</span>;
        }
    };

    const handleRequestCertificate = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock certificate creation
        const newCert: Certificate = {
            id: Date.now().toString(),
            subject: requestForm.subject,
            issuer: 'CN=EJBCA Root CA, O=KT Secure, C=UK',
            serialNumber: Math.random().toString(16).substring(2, 18).toUpperCase().match(/.{2}/g)?.join(':') || '',
            validFrom: new Date().toISOString(),
            validTo: new Date(Date.now() + requestForm.validityDays * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            keyId: requestForm.keyId
        };
        setCertificates([newCert, ...certificates]);
        setShowRequestModal(false);
        setRequestForm({ subject: '', keyId: '', caProvider: 'ejbca', validityDays: 365 });
    };

    return (
        <div>
            {/* CA Providers */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="card-header">
                    <h3>Certificate Authority Providers</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-md)', padding: 'var(--spacing-md)' }}>
                    {caProviders.map(ca => (
                        <div key={ca.id} style={{
                            padding: 'var(--spacing-lg)',
                            borderRadius: 'var(--radius-md)',
                            border: `1px solid ${ca.status === 'connected' ? 'var(--color-success)' : 'var(--color-border)'}`,
                            background: ca.status === 'connected' ? 'rgba(0, 200, 83, 0.05)' : 'var(--color-bg-secondary)'
                        }}>
                            <div className="flex items-center gap-md" style={{ marginBottom: 'var(--spacing-sm)' }}>
                                <Server size={24} style={{ color: ca.status === 'connected' ? 'var(--color-success)' : 'var(--color-text-muted)' }} />
                                <div>
                                    <div style={{ fontWeight: 600 }}>{ca.name}</div>
                                    <span className={`badge badge-${ca.status === 'connected' ? 'success' : 'secondary'}`}>
                                        {ca.status}
                                    </span>
                                </div>
                            </div>
                            {ca.url && (
                                <div className="text-sm text-muted" style={{ marginTop: 'var(--spacing-sm)' }}>
                                    <ExternalLink size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                    {ca.url}
                                </div>
                            )}
                            <button className="btn btn-secondary btn-sm" style={{ marginTop: 'var(--spacing-md)', width: '100%' }}>
                                {ca.status === 'connected' ? 'Configure' : 'Connect'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-md">
                        <Shield size={24} style={{ color: 'var(--color-accent-primary)' }} />
                        <div>
                            <div style={{ fontWeight: 600 }}>Certificates</div>
                            <div className="text-sm text-muted">{certificates.filter(c => c.status === 'active').length} active, {certificates.filter(c => c.status !== 'active').length} inactive</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-sm">
                        <button className="btn btn-secondary">
                            <RefreshCw size={16} />
                            Sync
                        </button>
                        <button className="btn btn-primary" onClick={() => setShowRequestModal(true)}>
                            <Plus size={16} />
                            Request Certificate
                        </button>
                    </div>
                </div>
            </div>

            {/* Certificates Table */}
            <div className="card" style={{ padding: 0 }}>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Issuer</th>
                                <th>Serial Number</th>
                                <th>Valid Until</th>
                                <th>Status</th>
                                <th style={{ width: '80px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {certificates.map(cert => (
                                <tr key={cert.id}>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{cert.subject.split(',')[0].replace('CN=', '')}</div>
                                        <div className="text-xs text-muted">{cert.subject}</div>
                                    </td>
                                    <td className="text-muted">{cert.issuer.split(',')[0].replace('CN=', '')}</td>
                                    <td>
                                        <code className="text-xs" style={{ background: 'var(--color-bg-tertiary)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>
                                            {cert.serialNumber}
                                        </code>
                                    </td>
                                    <td>{new Date(cert.validTo).toLocaleDateString()}</td>
                                    <td>{getStatusBadge(cert.status)}</td>
                                    <td>
                                        <button className="btn btn-ghost btn-sm">
                                            <Download size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Request Modal */}
            {showRequestModal && (
                <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Request Certificate</h2>
                        </div>
                        <form onSubmit={handleRequestCertificate}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Subject (DN)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="CN=My Signing Cert, O=My Org, C=US"
                                        value={requestForm.subject}
                                        onChange={e => setRequestForm({ ...requestForm, subject: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">CA Provider</label>
                                    <select
                                        className="form-input"
                                        value={requestForm.caProvider}
                                        onChange={e => setRequestForm({ ...requestForm, caProvider: e.target.value })}
                                    >
                                        {caProviders.filter(ca => ca.status === 'connected').map(ca => (
                                            <option key={ca.id} value={ca.id}>{ca.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Validity Period</label>
                                    <select
                                        className="form-input"
                                        value={requestForm.validityDays}
                                        onChange={e => setRequestForm({ ...requestForm, validityDays: parseInt(e.target.value) })}
                                    >
                                        <option value="365">1 Year</option>
                                        <option value="730">2 Years</option>
                                        <option value="1095">3 Years</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowRequestModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Request Certificate</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
