import { useState } from 'react';
import { Key, Shield, CheckCircle, AlertTriangle, Lock, Fingerprint, Server } from 'lucide-react';

interface KeyCeremonyWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (keyData: KeyData) => void;
}

interface KeyData {
    name: string;
    algorithm: 'RSA' | 'ECDSA';
    keySize?: number;
    curve?: string;
    hsmSlot: number;
}

const steps = [
    { id: 1, title: 'Key Parameters', icon: Key },
    { id: 2, title: 'HSM Selection', icon: Server },
    { id: 3, title: 'Security Review', icon: Shield },
    { id: 4, title: 'Confirmation', icon: CheckCircle }
];

export function KeyCeremonyWizard({ isOpen, onClose, onComplete }: KeyCeremonyWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [keyData, setKeyData] = useState<KeyData>({
        name: '',
        algorithm: 'RSA',
        keySize: 4096,
        hsmSlot: 1
    });
    const [confirmText, setConfirmText] = useState('');

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete(keyData);
            onClose();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1: return keyData.name.length >= 3;
            case 2: return keyData.hsmSlot > 0;
            case 3: return true;
            case 4: return confirmText === 'GENERATE KEY';
            default: return false;
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '700px', width: '90%' }}
            >
                <div className="modal-header">
                    <h2>Key Ceremony Wizard</h2>
                    <p className="text-sm text-muted">Generate a new cryptographic key in the HSM</p>
                </div>

                {/* Progress Steps */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: 'var(--spacing-lg)',
                    borderBottom: '1px solid var(--color-border)'
                }}>
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isComplete = currentStep > step.id;
                        return (
                            <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: 'var(--spacing-xs)'
                                }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: 'var(--radius-full)',
                                        background: isComplete ? 'var(--color-success)' : isActive ? 'var(--color-accent-gradient)' : 'var(--color-bg-secondary)',
                                        color: isComplete || isActive ? 'white' : 'var(--color-text-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {isComplete ? <CheckCircle size={20} /> : <Icon size={20} />}
                                    </div>
                                    <span className="text-xs" style={{
                                        fontWeight: isActive ? 600 : 400,
                                        color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)'
                                    }}>
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div style={{
                                        flex: 1,
                                        height: '2px',
                                        background: isComplete ? 'var(--color-success)' : 'var(--color-border)',
                                        margin: '0 var(--spacing-md)'
                                    }} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Step Content */}
                <div style={{ padding: 'var(--spacing-xl)' }}>
                    {currentStep === 1 && (
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Key Name *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={keyData.name}
                                    onChange={(e) => setKeyData({ ...keyData, name: e.target.value })}
                                    placeholder="e.g., prod-signing-2024"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Algorithm *</label>
                                <select
                                    className="form-input"
                                    value={keyData.algorithm}
                                    onChange={(e) => setKeyData({
                                        ...keyData,
                                        algorithm: e.target.value as 'RSA' | 'ECDSA',
                                        keySize: e.target.value === 'RSA' ? 4096 : undefined,
                                        curve: e.target.value === 'ECDSA' ? 'P-384' : undefined
                                    })}
                                >
                                    <option value="RSA">RSA</option>
                                    <option value="ECDSA">ECDSA</option>
                                </select>
                            </div>

                            {/* RSA/EC Conditional Fields (Gemini recommendation) */}
                            {keyData.algorithm === 'RSA' && (
                                <div className="form-group">
                                    <label className="form-label">Key Size *</label>
                                    <select
                                        className="form-input"
                                        value={keyData.keySize}
                                        onChange={(e) => setKeyData({ ...keyData, keySize: parseInt(e.target.value) })}
                                    >
                                        <option value="2048">2048 bits</option>
                                        <option value="3072">3072 bits</option>
                                        <option value="4096">4096 bits (Recommended)</option>
                                    </select>
                                </div>
                            )}

                            {keyData.algorithm === 'ECDSA' && (
                                <div className="form-group">
                                    <label className="form-label">Curve *</label>
                                    <select
                                        className="form-input"
                                        value={keyData.curve}
                                        onChange={(e) => setKeyData({ ...keyData, curve: e.target.value })}
                                    >
                                        <option value="P-256">P-256 (secp256r1)</option>
                                        <option value="P-384">P-384 (secp384r1) - Recommended</option>
                                        <option value="P-521">P-521 (secp521r1)</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="form-grid">
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label className="form-label">HSM Slot *</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)' }}>
                                    {[1, 2, 3, 4].map(slot => (
                                        <div
                                            key={slot}
                                            onClick={() => setKeyData({ ...keyData, hsmSlot: slot })}
                                            style={{
                                                padding: 'var(--spacing-lg)',
                                                borderRadius: 'var(--radius-md)',
                                                border: `2px solid ${keyData.hsmSlot === slot ? 'var(--color-accent-primary)' : 'var(--color-border)'}`,
                                                background: keyData.hsmSlot === slot ? 'var(--color-accent-subtle)' : 'var(--color-bg-secondary)',
                                                cursor: 'pointer',
                                                textAlign: 'center'
                                            }}
                                        >
                                            <Server size={24} style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-accent-primary)' }} />
                                            <div style={{ fontWeight: 600 }}>Slot {slot}</div>
                                            <div className="text-xs text-muted">{slot === 1 ? 'Production' : slot === 2 ? 'Staging' : slot === 3 ? 'Development' : 'Backup'}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div>
                            <div className="alert alert-warning" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <AlertTriangle size={20} />
                                <div>
                                    <strong>Security Notice</strong>
                                    <p className="text-sm">This operation will generate a cryptographic key in the HSM. The private key will never leave the hardware security module.</p>
                                </div>
                            </div>

                            <div className="card" style={{ background: 'var(--color-bg-secondary)' }}>
                                <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                                    <div className="flex items-center gap-md">
                                        <Key size={18} style={{ color: 'var(--color-accent-primary)' }} />
                                        <span>Name: <strong>{keyData.name}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-md">
                                        <Lock size={18} style={{ color: 'var(--color-accent-primary)' }} />
                                        <span>Algorithm: <strong>{keyData.algorithm}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-md">
                                        <Fingerprint size={18} style={{ color: 'var(--color-accent-primary)' }} />
                                        <span>
                                            {keyData.algorithm === 'RSA'
                                                ? `Key Size: ${keyData.keySize} bits`
                                                : `Curve: ${keyData.curve}`
                                            }
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-md">
                                        <Server size={18} style={{ color: 'var(--color-accent-primary)' }} />
                                        <span>HSM Slot: <strong>{keyData.hsmSlot}</strong></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div>
                            <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <AlertTriangle size={20} />
                                <div>
                                    <strong>Type-to-Confirm Required</strong>
                                    <p className="text-sm">Type <code>GENERATE KEY</code> to confirm this irreversible operation.</p>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirmation</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="Type GENERATE KEY"
                                    style={{
                                        borderColor: confirmText === 'GENERATE KEY' ? 'var(--color-success)' : undefined
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="modal-actions">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        {currentStep > 1 && (
                            <button className="btn btn-secondary" onClick={handleBack}>Back</button>
                        )}
                        <button
                            className="btn btn-primary"
                            onClick={handleNext}
                            disabled={!isStepValid()}
                        >
                            {currentStep === steps.length ? 'Generate Key' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
