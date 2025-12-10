import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    confirmLabel = 'Confirm',
    variant = 'danger'
}: ConfirmDialogProps) {
    const [inputValue, setInputValue] = useState('');

    if (!isOpen) return null;

    const isValid = inputValue === confirmText;

    const handleConfirm = () => {
        if (isValid) {
            onConfirm();
            setInputValue('');
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                <div className="modal-header">
                    <div className="flex items-center gap-md">
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-full)',
                            background: variant === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <AlertTriangle size={20} style={{ color: variant === 'danger' ? 'var(--color-error)' : 'var(--color-warning)' }} />
                        </div>
                        <h2>{title}</h2>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: 'var(--spacing-lg)' }}>
                    <p className="text-secondary" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        {message}
                    </p>

                    <div className="form-group">
                        <label className="form-label">
                            Type <code style={{
                                background: 'var(--color-bg-secondary)',
                                padding: '2px 6px',
                                borderRadius: 'var(--radius-sm)'
                            }}>{confirmText}</code> to confirm
                        </label>
                        <input
                            type="text"
                            className="form-input"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={confirmText}
                            style={{
                                borderColor: isValid ? 'var(--color-success)' : undefined
                            }}
                        />
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
                    <button
                        className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-warning'}`}
                        onClick={handleConfirm}
                        disabled={!isValid}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
