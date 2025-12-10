import { useState } from 'react';
import {
    Key,
    Shield,
    Users,
    CheckCircle,
    Clock,
    AlertTriangle,
    ChevronRight,
    ChevronLeft,
    FileSignature,
    Lock,
    Eye,
    X
} from 'lucide-react';

interface KeyCeremonyWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (ceremonyData: CeremonyData) => void;
}

interface Witness {
    id: string;
    name: string;
    email: string;
    role: string;
    hasApproved: boolean;
    approvedAt?: string;
}

interface CeremonyData {
    keyName: string;
    algorithm: 'RSA-2048' | 'RSA-4096' | 'ECDSA-P256' | 'ECDSA-P384';
    purpose: string;
    organizationId: string;
    witnesses: Witness[];
    ceremonyDate: string;
    notes: string;
}

const STEPS = [
    { id: 1, title: 'Key Configuration', icon: Key },
    { id: 2, title: 'Witness Selection', icon: Users },
    { id: 3, title: 'Verification', icon: Eye },
    { id: 4, title: 'Generation', icon: Shield },
    { id: 5, title: 'Confirmation', icon: CheckCircle }
];

const AVAILABLE_WITNESSES: Witness[] = [
    { id: '1', name: 'John Admin', email: 'john@example.com', role: 'Security Officer', hasApproved: false },
    { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', role: 'Crypto Admin', hasApproved: false },
    { id: '3', name: 'Mike Ross', email: 'mike@example.com', role: 'Compliance Officer', hasApproved: false },
    { id: '4', name: 'Lisa Wang', email: 'lisa@example.com', role: 'Key Custodian', hasApproved: false },
];

export function KeyCeremonyWizard({ isOpen, onClose, onComplete }: KeyCeremonyWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [ceremonyData, setCeremonyData] = useState<CeremonyData>({
        keyName: '',
        algorithm: 'RSA-4096',
        purpose: '',
        organizationId: '',
        witnesses: [],
        ceremonyDate: new Date().toISOString().split('T')[0],
        notes: ''
    });

    if (!isOpen) return null;

    const handleWitnessToggle = (witness: Witness) => {
        const isSelected = ceremonyData.witnesses.some(w => w.id === witness.id);
        if (isSelected) {
            setCeremonyData(prev => ({
                ...prev,
                witnesses: prev.witnesses.filter(w => w.id !== witness.id)
            }));
        } else {
            setCeremonyData(prev => ({
                ...prev,
                witnesses: [...prev.witnesses, witness]
            }));
        }
    };

    const simulateWitnessApproval = () => {
        setCeremonyData(prev => ({
            ...prev,
            witnesses: prev.witnesses.map(w => ({
                ...w,
                hasApproved: true,
                approvedAt: new Date().toISOString()
            }))
        }));
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        // Simulate key generation
        await new Promise(resolve => setTimeout(resolve, 3000));
        setIsGenerating(false);
        setCurrentStep(5);
    };

    const handleComplete = () => {
        onComplete(ceremonyData);
        onClose();
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1:
                return ceremonyData.keyName && ceremonyData.algorithm && ceremonyData.purpose;
            case 2:
                return ceremonyData.witnesses.length >= 2;
            case 3:
                return ceremonyData.witnesses.every(w => w.hasApproved);
            case 4:
                return !isGenerating;
            default:
                return true;
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-lg">
                        <div className="form-group">
                            <label className="form-label">Key Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., prod-signing-2024"
                                value={ceremonyData.keyName}
                                onChange={(e) => setCeremonyData(prev => ({ ...prev, keyName: e.target.value }))}
                            />
                            <p className="text-sm text-muted mt-xs">Unique identifier for this key</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Algorithm *</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-sm)' }}>
                                {(['RSA-2048', 'RSA-4096', 'ECDSA-P256', 'ECDSA-P384'] as const).map(algo => (
                                    <button
                                        key={algo}
                                        type="button"
                                        onClick={() => setCeremonyData(prev => ({ ...prev, algorithm: algo }))}
                                        className={`btn ${ceremonyData.algorithm === algo ? 'btn-primary' : 'btn-secondary'}`}
                                        style={{ justifyContent: 'center' }}
                                    >
                                        <Lock size={16} />
                                        {algo}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Purpose *</label>
                            <select
                                className="form-input"
                                value={ceremonyData.purpose}
                                onChange={(e) => setCeremonyData(prev => ({ ...prev, purpose: e.target.value }))}
                            >
                                <option value="">Select purpose...</option>
                                <option value="code_signing">Code Signing</option>
                                <option value="firmware_signing">Firmware Signing</option>
                                <option value="document_signing">Document Signing</option>
                                <option value="certificate_authority">Certificate Authority</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Ceremony Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={ceremonyData.ceremonyDate}
                                onChange={(e) => setCeremonyData(prev => ({ ...prev, ceremonyDate: e.target.value }))}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Notes</label>
                            <textarea
                                className="form-input"
                                rows={3}
                                placeholder="Additional ceremony notes..."
                                value={ceremonyData.notes}
                                onChange={(e) => setCeremonyData(prev => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-lg">
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'var(--color-warning-bg)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-warning)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)'
                        }}>
                            <AlertTriangle size={20} style={{ color: 'var(--color-warning)' }} />
                            <span>Select at least 2 witnesses for the key ceremony</span>
                        </div>

                        <div className="space-y-sm">
                            {AVAILABLE_WITNESSES.map(witness => {
                                const isSelected = ceremonyData.witnesses.some(w => w.id === witness.id);
                                return (
                                    <div
                                        key={witness.id}
                                        onClick={() => handleWitnessToggle(witness)}
                                        style={{
                                            padding: 'var(--spacing-md)',
                                            background: isSelected ? 'var(--color-accent-subtle)' : 'var(--color-bg-secondary)',
                                            border: `1px solid ${isSelected ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
                                            borderRadius: 'var(--radius-md)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <div className="flex items-center gap-md">
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: 'var(--radius-full)',
                                                background: 'var(--color-bg-tertiary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Users size={20} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{witness.name}</div>
                                                <div className="text-sm text-muted">{witness.role}</div>
                                            </div>
                                        </div>
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: 'var(--radius-sm)',
                                            border: `2px solid ${isSelected ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
                                            background: isSelected ? 'var(--color-accent-primary)' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {isSelected && <CheckCircle size={16} style={{ color: 'white' }} />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-sm text-muted">
                            Selected: {ceremonyData.witnesses.length} witness(es)
                        </p>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-lg">
                        <div className="card" style={{ background: 'var(--color-bg-tertiary)' }}>
                            <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Ceremony Summary</h4>
                            <div className="space-y-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted">Key Name:</span>
                                    <span style={{ fontWeight: 500 }}>{ceremonyData.keyName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Algorithm:</span>
                                    <span style={{ fontWeight: 500 }}>{ceremonyData.algorithm}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Purpose:</span>
                                    <span style={{ fontWeight: 500 }}>{ceremonyData.purpose}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Date:</span>
                                    <span style={{ fontWeight: 500 }}>{ceremonyData.ceremonyDate}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ marginBottom: 'var(--spacing-md)' }}>Witness Approvals</h4>
                            <div className="space-y-sm">
                                {ceremonyData.witnesses.map(witness => (
                                    <div
                                        key={witness.id}
                                        style={{
                                            padding: 'var(--spacing-md)',
                                            background: 'var(--color-bg-secondary)',
                                            borderRadius: 'var(--radius-md)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{witness.name}</div>
                                            <div className="text-sm text-muted">{witness.role}</div>
                                        </div>
                                        {witness.hasApproved ? (
                                            <span className="badge badge-success">
                                                <CheckCircle size={14} /> Approved
                                            </span>
                                        ) : (
                                            <span className="badge badge-warning">
                                                <Clock size={14} /> Pending
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {!ceremonyData.witnesses.every(w => w.hasApproved) && (
                            <button
                                className="btn btn-primary"
                                onClick={simulateWitnessApproval}
                                style={{ width: '100%' }}
                            >
                                <FileSignature size={18} />
                                Simulate Witness Approvals
                            </button>
                        )}
                    </div>
                );

            case 4:
                return (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                        {isGenerating ? (
                            <>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    margin: '0 auto var(--spacing-lg)',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--color-accent-gradient)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    animation: 'pulse 2s infinite'
                                }}>
                                    <Key size={40} style={{ color: 'white' }} />
                                </div>
                                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Generating Key...</h3>
                                <p className="text-muted">
                                    Performing key ceremony in Hardware Security Module
                                </p>
                                <div style={{
                                    marginTop: 'var(--spacing-lg)',
                                    height: '4px',
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-full)',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: '60%',
                                        background: 'var(--color-accent-gradient)',
                                        animation: 'shimmer 1.5s infinite'
                                    }} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    margin: '0 auto var(--spacing-lg)',
                                    borderRadius: 'var(--radius-full)',
                                    background: 'var(--color-bg-tertiary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Shield size={40} style={{ color: 'var(--color-accent-primary)' }} />
                                </div>
                                <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Ready to Generate</h3>
                                <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                    All witnesses have approved. Click below to generate the key.
                                </p>
                                <button className="btn btn-primary btn-lg" onClick={handleGenerate}>
                                    <Key size={20} />
                                    Generate Key in HSM
                                </button>
                            </>
                        )}
                    </div>
                );

            case 5:
                return (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            margin: '0 auto var(--spacing-lg)',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--color-success)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <CheckCircle size={40} style={{ color: 'white' }} />
                        </div>
                        <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Key Ceremony Complete!</h3>
                        <p className="text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            The key has been successfully generated and stored in the HSM.
                        </p>

                        <div className="card" style={{
                            background: 'var(--color-bg-tertiary)',
                            textAlign: 'left',
                            marginBottom: 'var(--spacing-lg)'
                        }}>
                            <div className="space-y-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted">Key ID:</span>
                                    <code>key-{Date.now()}</code>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Fingerprint:</span>
                                    <code>SHA256:xYz...AbC</code>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">HSM Slot:</span>
                                    <code>SLOT-001</code>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1000
                }}
                onClick={onClose}
            />
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '600px',
                maxHeight: '90vh',
                background: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1001,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: 'var(--spacing-lg)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <h2 style={{ marginBottom: 'var(--spacing-xs)' }}>Key Ceremony Wizard</h2>
                        <p className="text-sm text-muted">HSM-compliant key generation workflow</p>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Steps */}
                <div style={{
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = step.id === currentStep;
                        const isComplete = step.id < currentStep;
                        return (
                            <div
                                key={step.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-sm)'
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: 'var(--radius-full)',
                                    background: isComplete
                                        ? 'var(--color-success)'
                                        : isActive
                                            ? 'var(--color-accent-primary)'
                                            : 'var(--color-bg-tertiary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {isComplete ? (
                                        <CheckCircle size={16} style={{ color: 'white' }} />
                                    ) : (
                                        <Icon size={16} style={{ color: isActive ? 'white' : 'var(--color-text-muted)' }} />
                                    )}
                                </div>
                                {index < STEPS.length - 1 && (
                                    <div style={{
                                        width: '30px',
                                        height: '2px',
                                        background: isComplete ? 'var(--color-success)' : 'var(--color-border)'
                                    }} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: 'var(--spacing-lg)', overflowY: 'auto' }}>
                    <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>
                        {STEPS[currentStep - 1].title}
                    </h3>
                    {renderStep()}
                </div>

                {/* Footer */}
                <div style={{
                    padding: 'var(--spacing-lg)',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between'
                }}>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setCurrentStep(prev => prev - 1)}
                        disabled={currentStep === 1}
                    >
                        <ChevronLeft size={18} />
                        Back
                    </button>

                    {currentStep < 5 ? (
                        <button
                            className="btn btn-primary"
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            disabled={!canProceed()}
                        >
                            {currentStep === 4 ? 'Skip' : 'Next'}
                            <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={handleComplete}>
                            <CheckCircle size={18} />
                            Complete Ceremony
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}

export default KeyCeremonyWizard;
