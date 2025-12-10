import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, Shield, Download } from 'lucide-react';

interface UploadedCertificate {
    id: string;
    filename: string;
    subject: string;
    issuer: string;
    validFrom: string;
    validTo: string;
    status: 'valid' | 'expired' | 'invalid';
    uploadedAt: string;
}

interface CertificateUploadProps {
    onUpload?: (cert: UploadedCertificate) => void;
}

export function CertificateUpload({ onUpload }: CertificateUploadProps) {
    const [certificates, setCertificates] = useState<UploadedCertificate[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const handleFiles = async (files: File[]) => {
        setError('');
        setUploading(true);

        for (const file of files) {
            // Validate file type
            const validTypes = ['.pem', '.crt', '.cer', '.der', '.p7b', '.p12', '.pfx'];
            const ext = '.' + file.name.split('.').pop()?.toLowerCase();

            if (!validTypes.includes(ext)) {
                setError(`Invalid file type: ${file.name}. Supported: ${validTypes.join(', ')}`);
                continue;
            }

            // Mock certificate parsing (in production, send to backend)
            const mockCert: UploadedCertificate = {
                id: Date.now().toString(),
                filename: file.name,
                subject: `CN=${file.name.replace(/\.[^.]+$/, '')}, O=Uploaded Certificate`,
                issuer: 'CN=Custom CA, O=Organization',
                validFrom: new Date().toISOString(),
                validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                status: 'valid',
                uploadedAt: new Date().toISOString()
            };

            setCertificates(prev => [...prev, mockCert]);
            onUpload?.(mockCert);
        }

        setUploading(false);
    };

    const removeCertificate = (id: string) => {
        setCertificates(prev => prev.filter(c => c.id !== id));
    };

    const getStatusBadge = (status: UploadedCertificate['status']) => {
        switch (status) {
            case 'valid': return <span className="badge badge-success"><CheckCircle size={12} /> Valid</span>;
            case 'expired': return <span className="badge badge-error"><AlertCircle size={12} /> Expired</span>;
            case 'invalid': return <span className="badge badge-warning"><AlertCircle size={12} /> Invalid</span>;
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex items-center gap-md">
                    <Shield size={20} style={{ color: 'var(--color-accent-primary)' }} />
                    <h3>X.509 Certificate Upload</h3>
                </div>
            </div>

            {/* Drop Zone */}
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    margin: 'var(--spacing-md)',
                    padding: 'var(--spacing-xl)',
                    border: `2px dashed ${isDragging ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    background: isDragging ? 'rgba(139, 92, 246, 0.05)' : 'var(--color-bg-secondary)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
            >
                <Upload size={40} style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-md)' }} />
                <div style={{ fontWeight: 500, marginBottom: 'var(--spacing-sm)' }}>
                    {uploading ? 'Uploading...' : 'Drop certificates here or click to browse'}
                </div>
                <div className="text-sm text-muted">
                    Supports: PEM, CRT, CER, DER, P7B, P12, PFX
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pem,.crt,.cer,.der,.p7b,.p12,.pfx"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
            </div>

            {/* Error */}
            {error && (
                <div className="alert alert-error" style={{ margin: 'var(--spacing-md)' }}>
                    <AlertCircle size={16} />
                    <span>{error}</span>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setError('')}>
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Uploaded Certificates */}
            {certificates.length > 0 && (
                <div style={{ padding: 'var(--spacing-md)' }}>
                    <div className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-sm)' }}>
                        Uploaded Certificates ({certificates.length})
                    </div>
                    {certificates.map(cert => (
                        <div
                            key={cert.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 'var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--color-bg-tertiary)',
                                marginBottom: 'var(--spacing-sm)'
                            }}
                        >
                            <div className="flex items-center gap-md">
                                <FileText size={20} style={{ color: 'var(--color-accent-primary)' }} />
                                <div>
                                    <div style={{ fontWeight: 500 }}>{cert.filename}</div>
                                    <div className="text-xs text-muted">{cert.subject}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-md">
                                {getStatusBadge(cert.status)}
                                <button className="btn btn-ghost btn-icon btn-sm">
                                    <Download size={16} />
                                </button>
                                <button
                                    className="btn btn-ghost btn-icon btn-sm"
                                    onClick={() => removeCertificate(cert.id)}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
