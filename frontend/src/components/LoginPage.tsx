import { useState } from 'react';
import { Lock, Mail, User, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
}

interface LoginPageProps {
    onLogin: (token: string, user: AuthUser) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const [isRegister, setIsRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Try real backend first
            if (isRegister) {
                const res = await fetch(`${API_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.detail || 'Registration failed');
                }
                setIsRegister(false);
            }

            const loginRes = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    username: formData.email,
                    password: formData.password
                })
            });

            if (!loginRes.ok) {
                const data = await loginRes.json();
                throw new Error(data.detail || 'Login failed');
            }

            const data = await loginRes.json();
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));
            onLogin(data.access_token, data.user);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            // Demo mode fallback when backend unavailable
            if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
                console.log('Backend unavailable, using demo mode');
                const demoUser = {
                    id: 'demo-1',
                    email: formData.email || 'demo@ktsecure.com',
                    name: formData.name || 'Demo User',
                    role: 'admin',
                    status: 'active'
                };
                const demoToken = 'demo-token-' + Date.now();
                localStorage.setItem('token', demoToken);
                localStorage.setItem('user', JSON.stringify(demoUser));
                onLogin(demoToken, demoUser);
                return;
            }
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                padding: 'var(--spacing-xl)',
                background: 'var(--color-bg-primary)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <div style={{
                        display: 'inline-flex',
                        background: 'white',
                        borderRadius: 'var(--radius-md)',
                        padding: '8px 16px',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        <img src="/kt-secure-logo.png" alt="KT Secure" style={{ height: '32px' }} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                        {isRegister ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-muted">
                        {isRegister ? 'Sign up to get started' : 'Sign in to your account'}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: 'var(--spacing-lg)' }}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {isRegister && (
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div className="input-with-icon">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    style={{ paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="input-with-icon">
                            <Mail size={18} className="input-icon" />
                            <input
                                type="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--color-text-muted)'
                                }}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
                        disabled={loading}
                    >
                        {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                {/* Toggle */}
                <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
                    <span className="text-muted">
                        {isRegister ? 'Already have an account?' : "Don't have an account?"}
                    </span>{' '}
                    <button
                        type="button"
                        onClick={() => { setIsRegister(!isRegister); setError(''); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-accent-primary)',
                            cursor: 'pointer',
                            fontWeight: 500
                        }}
                    >
                        {isRegister ? 'Sign In' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
}
