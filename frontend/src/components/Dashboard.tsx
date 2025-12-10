import { useEffect, useState } from 'react';
import {
    Building2,
    Users,
    Key,
    FileSignature,
    Cpu,
    TrendingUp,
    Shield,
    Activity,
    Send,
    X,
    Bot,
    Sparkles
} from 'lucide-react';
import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { api } from '../services/api';
import { sendGeminiMessage, type GeminiMessage } from '../services/gemini';

// Mock data for charts
const keyActivityData = [
    { month: 'Jul', keys: 2, signings: 145 },
    { month: 'Aug', keys: 3, signings: 289 },
    { month: 'Sep', keys: 2, signings: 456 },
    { month: 'Oct', keys: 4, signings: 678 },
    { month: 'Nov', keys: 3, signings: 892 },
    { month: 'Dec', keys: 5, signings: 1234 }
];

const keyTypeData = [
    { name: 'RSA-4096', value: 35, color: '#8b5cf6' },
    { name: 'RSA-2048', value: 28, color: '#a78bfa' },
    { name: 'ECDSA-P384', value: 22, color: '#06b6d4' },
    { name: 'ECDSA-P256', value: 15, color: '#10b981' }
];


interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function Dashboard() {
    const [stats, setStats] = useState<{
        totalOrganizations: number;
        activeOrganizations: number;
        totalUsers: number;
        activeUsers: number;
        totalKeys: number;
        activeKeys: number;
        totalSigningConfigs: number;
        enabledConfigs: number;
        totalProjects: number;
        recentActivity: Array<{ type: string; message: string; time: string }>;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I\'m your KT Secure AI assistant. I can help you with questions about organizations, HSM operations, code signing, and more. How can I assist you today?',
            timestamp: new Date()
        }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [conversationHistory, setConversationHistory] = useState<GeminiMessage[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.getDashboardStats();
                setStats(data);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: chatInput,
            timestamp: new Date()
        };
        setChatMessages(prev => [...prev, userMessage]);
        setChatInput('');
        setIsTyping(true);

        // Call Gemini API
        try {
            const response = await sendGeminiMessage(chatInput, conversationHistory);

            // Update conversation history
            setConversationHistory(prev => [
                ...prev,
                { role: 'user', parts: [{ text: chatInput }] },
                { role: 'model', parts: [{ text: response }] }
            ]);

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ height: '50vh' }}>
                <div className="animate-pulse text-muted">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent-primary)' }}>
                        <Building2 size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.totalOrganizations}</div>
                        <div className="stat-label">Organizations</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(0, 168, 168, 0.12)', color: '#00a8a8' }}>
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.totalUsers}</div>
                        <div className="stat-label">Users</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(0, 200, 83, 0.12)', color: '#00c853' }}>
                        <Key size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.totalKeys}</div>
                        <div className="stat-label">Active Keys</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(255, 171, 0, 0.12)', color: '#ffab00' }}>
                        <FileSignature size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.enabledConfigs}</div>
                        <div className="stat-label">Signing Configs</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(0, 184, 212, 0.12)', color: '#00b8d4' }}>
                        <Cpu size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.totalProjects}</div>
                        <div className="stat-label">Projects / ECUs</div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
                {/* Key Generation & Signing Activity Chart */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Key Generation & Signing Activity</h3>
                            <p className="card-subtitle">Monthly trend over the last 6 months</p>
                        </div>
                        <div className="flex items-center gap-sm">
                            <TrendingUp size={20} style={{ color: 'var(--color-success)' }} />
                            <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>+24%</span>
                        </div>
                    </div>
                    <div style={{ height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={keyActivityData}>
                                <defs>
                                    <linearGradient id="colorKeys" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSignings" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(120, 120, 130, 0.15)" />
                                <XAxis dataKey="month" stroke="#6b6b75" fontSize={12} />
                                <YAxis yAxisId="left" stroke="#6b6b75" fontSize={12} />
                                <YAxis yAxisId="right" orientation="right" stroke="#6b6b75" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e1e24',
                                        border: '1px solid rgba(120, 120, 130, 0.25)',
                                        borderRadius: '8px',
                                        color: '#fafafa'
                                    }}
                                />
                                <Legend />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="keys"
                                    name="Keys Generated"
                                    stroke="#8b5cf6"
                                    fillOpacity={1}
                                    fill="url(#colorKeys)"
                                    strokeWidth={2}
                                />
                                <Area
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="signings"
                                    name="Signing Operations"
                                    stroke="#06b6d4"
                                    fillOpacity={1}
                                    fill="url(#colorSignings)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Key Type Distribution */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3 className="card-title">Key Type Distribution</h3>
                            <p className="card-subtitle">By algorithm</p>
                        </div>
                    </div>
                    <div style={{ height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={keyTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {keyTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#1e1e24',
                                        border: '1px solid rgba(120, 120, 130, 0.25)',
                                        borderRadius: '8px',
                                        color: '#fafafa'
                                    }}
                                    formatter={(value: number) => [`${value}%`, 'Share']}
                                />
                                <Legend
                                    layout="vertical"
                                    align="right"
                                    verticalAlign="middle"
                                    formatter={(value) => <span style={{ color: '#a0a0a8' }}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                {/* Recent Activity */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Activity</h3>
                        <Activity size={20} className="text-muted" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {stats?.recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center gap-md" style={{ padding: 'var(--spacing-sm) 0' }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: 'var(--radius-full)',
                                    background: activity.type === 'signing' ? 'var(--color-accent-primary)' :
                                        activity.type === 'key' ? 'var(--color-crypto)' :
                                            activity.type === 'user' ? 'var(--color-success)' :
                                                'var(--color-warning)',
                                    flexShrink: 0
                                }} />
                                <span style={{ flex: 1 }}>{activity.message}</span>
                                <span className="text-muted text-sm">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Health */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">System Health</h3>
                        <Shield size={20} style={{ color: 'var(--color-success)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        <div className="flex items-center justify-between" style={{ padding: 'var(--spacing-sm) 0' }}>
                            <span>HSM Connection</span>
                            <span className="badge badge-success">Connected</span>
                        </div>
                        <div className="flex items-center justify-between" style={{ padding: 'var(--spacing-sm) 0' }}>
                            <span>Certificate Status</span>
                            <span className="badge badge-success">Valid</span>
                        </div>
                        <div className="flex items-center justify-between" style={{ padding: 'var(--spacing-sm) 0' }}>
                            <span>Signing Service</span>
                            <span className="badge badge-success">Operational</span>
                        </div>
                        <div className="flex items-center justify-between" style={{ padding: 'var(--spacing-sm) 0' }}>
                            <span>Audit Logging</span>
                            <span className="badge badge-success">Active</span>
                        </div>
                        <div className="flex items-center justify-between" style={{ padding: 'var(--spacing-sm) 0' }}>
                            <span>EJBCA Integration</span>
                            <span className="badge badge-success">Connected</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Chatbot Button */}
            <button
                onClick={() => setChatOpen(true)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-accent-gradient)',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-glow)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all var(--transition-base)',
                    zIndex: 500
                }}
                className="chatbot-trigger"
            >
                <Bot size={28} />
            </button>

            {/* AI Chatbot Panel */}
            {chatOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: '100px',
                    right: '24px',
                    width: '400px',
                    height: '500px',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-lg)',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 501,
                    overflow: 'hidden'
                }}>
                    {/* Chat Header */}
                    <div style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        borderBottom: '1px solid var(--color-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--color-bg-tertiary)'
                    }}>
                        <div className="flex items-center gap-sm">
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: 'var(--radius-md)',
                                background: 'var(--color-accent-gradient)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Sparkles size={20} color="white" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600 }}>KT Secure AI</div>
                                <div className="text-sm text-muted">Powered by Gemini</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setChatOpen(false)}
                            className="btn btn-ghost btn-icon"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div style={{
                        flex: 1,
                        padding: 'var(--spacing-md)',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-md)'
                    }}>
                        {chatMessages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <div style={{
                                    maxWidth: '80%',
                                    padding: 'var(--spacing-sm) var(--spacing-md)',
                                    borderRadius: msg.role === 'user'
                                        ? 'var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)'
                                        : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)',
                                    background: msg.role === 'user'
                                        ? 'var(--color-accent-primary)'
                                        : 'var(--color-bg-tertiary)',
                                    color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)'
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{
                                    padding: 'var(--spacing-sm) var(--spacing-md)',
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--color-bg-tertiary)'
                                }}>
                                    <span className="animate-pulse">Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div style={{
                        padding: 'var(--spacing-md)',
                        borderTop: '1px solid var(--color-border)',
                        display: 'flex',
                        gap: 'var(--spacing-sm)'
                    }}>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Ask about HSM, signing, organizations..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            style={{ flex: 1 }}
                        />
                        <button
                            onClick={handleSendMessage}
                            className="btn btn-primary btn-icon"
                            disabled={!chatInput.trim()}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
