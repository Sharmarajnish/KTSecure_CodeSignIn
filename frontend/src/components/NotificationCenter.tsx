```typescript
import { useState } from 'react';
import {
    Bell,
    X,
    CheckCircle,
    AlertTriangle,
    Info,
    XCircle
} from 'lucide-react';

export interface Notification {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    action?: {
        label: string;
        href: string;
    };
}

// Mock notifications
const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'success',
        title: 'Key Generated Successfully',
        message: 'RSA-4096 key "prod-signing-2024" has been generated in HSM Slot 1.',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        read: false,
        action: { label: 'View Key', href: '/keys' }
    },
    {
        id: '2',
        type: 'warning',
        title: 'Certificate Expiring Soon',
        message: 'Certificate for "automotive-firmware" expires in 30 days.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: false,
        action: { label: 'Renew Now', href: '/signing-configs' }
    },
    {
        id: '3',
        type: 'info',
        title: 'New User Added',
        message: 'John Smith was added to "Acme Corp" organization.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        read: true
    },
    {
        id: '4',
        type: 'error',
        title: 'Signing Operation Failed',
        message: 'HSM connection timeout during firmware signing.',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        read: true,
        action: { label: 'View Logs', href: '/audit-logs' }
    },
    {
        id: '5',
        type: 'success',
        title: 'Organization Created',
        message: 'New organization "SecureTech Ltd" has been provisioned.',
        timestamp: new Date(Date.now() - 1000 * 60 * 180),
        read: true
    }
];

interface NotificationCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const unreadCount = notifications.filter(n => !n.read).length;
    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.read);

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success': return <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />;
            case 'warning': return <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />;
            case 'error': return <XCircle size={18} style={{ color: 'var(--color-error)' }} />;
            case 'info': return <Info size={18} style={{ color: 'var(--color-info)' }} />;
        }
    };

    const formatTime = (date: Date) => {
        const diff = Date.now() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${ minutes }m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${ hours }h ago`;
        return `${ Math.floor(hours / 24) }d ago`;
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.3)',
                    zIndex: 999
                }}
                onClick={onClose}
            />

            {/* Panel */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '400px',
                background: 'var(--color-bg-primary)',
                borderLeft: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideIn 0.2s ease'
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
                        <h2 style={{ marginBottom: 'var(--spacing-xs)' }}>Notifications</h2>
                        <p className="text-sm text-muted">{unreadCount} unread</p>
                    </div>
                    <div className="flex items-center gap-sm">
                        <button
                            onClick={markAllAsRead}
                            className="btn btn-ghost"
                            style={{ fontSize: '0.85rem' }}
                        >
                            Mark all read
                        </button>
                        <button onClick={onClose} className="btn btn-ghost btn-icon">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div style={{
                    padding: 'var(--spacing-sm) var(--spacing-lg)',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    gap: 'var(--spacing-sm)'
                }}>
                    <button
                        onClick={() => setFilter('all')}
                        className={`btn btn - sm ${ filter === 'all' ? 'btn-primary' : 'btn-ghost' } `}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`btn btn - sm ${ filter === 'unread' ? 'btn-primary' : 'btn-ghost' } `}
                    >
                        Unread ({unreadCount})
                    </button>
                </div>

                {/* Notifications List */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {filteredNotifications.length === 0 ? (
                        <div style={{
                            padding: 'var(--spacing-2xl)',
                            textAlign: 'center',
                            color: 'var(--color-text-muted)'
                        }}>
                            <Bell size={48} style={{ marginBottom: 'var(--spacing-md)', opacity: 0.5 }} />
                            <p>No notifications</p>
                        </div>
                    ) : (
                        filteredNotifications.map(notification => (
                            <div
                                key={notification.id}
                                onClick={() => markAsRead(notification.id)}
                                style={{
                                    padding: 'var(--spacing-md) var(--spacing-lg)',
                                    borderBottom: '1px solid var(--color-border)',
                                    background: notification.read ? 'transparent' : 'var(--color-accent-subtle)',
                                    cursor: 'pointer',
                                    transition: 'background var(--transition-fast)'
                                }}
                            >
                                <div className="flex items-start gap-md">
                                    <div style={{ marginTop: '2px' }}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-xs)' }}>
                                            <strong style={{ fontSize: '0.9rem' }}>{notification.title}</strong>
                                            <span className="text-xs text-muted">{formatTime(notification.timestamp)}</span>
                                        </div>
                                        <p className="text-sm text-secondary" style={{ marginBottom: notification.action ? 'var(--spacing-sm)' : 0 }}>
                                            {notification.message}
                                        </p>
                                        {notification.action && (
                                            <a
                                                href={notification.action.href}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 'var(--spacing-xs)',
                                                    fontSize: '0.85rem',
                                                    color: 'var(--color-accent-primary)',
                                                    textDecoration: 'none',
                                                    fontWeight: 500
                                                }}
                                            >
                                                {notification.action.label} →
                                            </a>
                                        )}
                                    </div>
                                    {!notification.read && (
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: 'var(--radius-full)',
                                            background: 'var(--color-accent-primary)',
                                            flexShrink: 0,
                                            marginTop: '6px'
                                        }} />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    borderTop: '1px solid var(--color-border)',
                    textAlign: 'center'
                }}>
                    <a
                        href="/audit-logs"
                        style={{
                            color: 'var(--color-accent-primary)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}
                    >
                        View all activity →
                    </a>
                </div>
            </div>
        </>
    );
}

interface NotificationBadgeProps {
    onClick: () => void;
}

export function NotificationBadge({ onClick }: NotificationBadgeProps) {
    const unreadCount = mockNotifications.filter(n => !n.read).length;

    return (
        <button
            onClick={onClick}
            className="btn btn-ghost btn-icon"
            style={{ position: 'relative' }}
        >
            <Bell size={20} />
            {unreadCount > 0 && (
                <span style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '16px',
                    height: '16px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-error)',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {unreadCount}
                </span>
            )}
        </button>
    );
}
