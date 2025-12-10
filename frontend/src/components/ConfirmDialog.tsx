import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    requireTyping?: boolean;
    typingPhrase?: string;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    requireTyping = false,
    typingPhrase
}: ConfirmDialogProps) {
    const [typedValue, setTypedValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const phrase = typingPhrase || title;

    // Focus input when dialog requires typing
    useEffect(() => {
        if (isOpen && requireTyping) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen, requireTyping]);

    // Handler to reset and close
    const handleClose = () => {
        setTypedValue('');
        onClose();
    };

    if (!isOpen) return null;

    const typeColors = {
        danger: {
            bg: 'var(--color-error-bg)',
            border: 'var(--color-error)',
            icon: 'var(--color-error)',
            button: 'var(--color-error)'
        },
        warning: {
            bg: 'var(--color-warning-bg)',
            border: 'var(--color-warning)',
            icon: 'var(--color-warning)',
            button: 'var(--color-warning)'
        },
        info: {
            bg: 'var(--color-info-bg)',
            border: 'var(--color-info)',
            icon: 'var(--color-info)',
            button: 'var(--color-accent-primary)'
        }
    };

    const colors = typeColors[type];
    const canConfirm = !requireTyping || typedValue.toLowerCase() === phrase.toLowerCase();

    const handleConfirm = () => {
        if (canConfirm) {
            setTypedValue('');
            onConfirm();
            onClose();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1000
                }}
                onClick={handleClose}
            />

            {/* Dialog */}
            <div
                style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '440px',
                    background: 'var(--color-bg-primary)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-lg)',
                    zIndex: 1001,
                    overflow: 'hidden'
                }}
            >
                {/* Warning Banner */}
                <div
                    style={{
                        padding: 'var(--spacing-lg)',
                        background: colors.bg,
                        borderBottom: `1px solid ${colors.border}`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 'var(--spacing-md)'
                    }}
                >
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-full)',
                            background: colors.icon,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}
                    >
                        <AlertTriangle size={20} style={{ color: 'white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>{title}</h3>
                        <p className="text-secondary">{message}</p>
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Type to Confirm */}
                {requireTyping && (
                    <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--color-border)' }}>
                        <p className="text-sm" style={{ marginBottom: 'var(--spacing-sm)' }}>
                            To confirm, type <strong>"{phrase}"</strong> below:
                        </p>
                        <input
                            ref={inputRef}
                            type="text"
                            className="form-input"
                            placeholder={`Type "${phrase}" to confirm`}
                            value={typedValue}
                            onChange={(e) => setTypedValue(e.target.value)}
                            style={{
                                borderColor: typedValue && !canConfirm ? 'var(--color-error)' : undefined
                            }}
                        />
                        {typedValue && !canConfirm && (
                            <p className="text-sm text-error" style={{ marginTop: 'var(--spacing-xs)' }}>
                                The text doesn't match
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div
                    style={{
                        padding: 'var(--spacing-lg)',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 'var(--spacing-sm)'
                    }}
                >
                    <button className="btn btn-secondary" onClick={handleClose}>
                        {cancelText}
                    </button>
                    <button
                        className="btn"
                        style={{
                            background: colors.button,
                            color: 'white',
                            opacity: canConfirm ? 1 : 0.5,
                            cursor: canConfirm ? 'pointer' : 'not-allowed'
                        }}
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </>
    );
}

export default ConfirmDialog;
