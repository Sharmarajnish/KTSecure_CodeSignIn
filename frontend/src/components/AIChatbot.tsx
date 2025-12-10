import { useState } from 'react';
import { Send, X, Bot, Sparkles } from 'lucide-react';
import { sendGeminiMessage, type GeminiMessage } from '../services/gemini';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function AIChatbot() {
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

        try {
            const response = await sendGeminiMessage(chatInput, conversationHistory);

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
        } catch {
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

    return (
        <>
            {/* Floating AI Button */}
            {!chatOpen && (
                <button
                    onClick={() => setChatOpen(true)}
                    className="ai-chat-button"
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        width: '60px',
                        height: '60px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--color-accent-gradient)',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-glow)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        transition: 'transform var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Sparkles size={28} />
                </button>
            )}

            {/* Chat Panel */}
            {chatOpen && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        width: '380px',
                        height: '500px',
                        background: 'var(--color-bg-primary)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 1000,
                        overflow: 'hidden'
                    }}
                >
                    {/* Chat Header */}
                    <div
                        style={{
                            padding: 'var(--spacing-md)',
                            background: 'var(--color-accent-gradient)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div className="flex items-center gap-sm">
                            <Bot size={20} />
                            <span style={{ fontWeight: 600 }}>KT Secure AI Assistant</span>
                        </div>
                        <button
                            onClick={() => setChatOpen(false)}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                padding: '4px',
                                cursor: 'pointer',
                                color: 'white'
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: 'var(--spacing-md)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--spacing-sm)'
                        }}
                    >
                        {chatMessages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%',
                                    padding: 'var(--spacing-sm) var(--spacing-md)',
                                    borderRadius: 'var(--radius-md)',
                                    background: msg.role === 'user'
                                        ? 'var(--color-accent-gradient)'
                                        : 'var(--color-bg-secondary)',
                                    color: msg.role === 'user' ? 'white' : 'var(--color-text-primary)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {msg.content}
                            </div>
                        ))}
                        {isTyping && (
                            <div
                                style={{
                                    alignSelf: 'flex-start',
                                    padding: 'var(--spacing-sm) var(--spacing-md)',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'var(--color-bg-secondary)',
                                    color: 'var(--color-text-muted)',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <span className="animate-pulse">Thinking...</span>
                            </div>
                        )}
                    </div>

                    {/* Chat Input */}
                    <div
                        style={{
                            padding: 'var(--spacing-md)',
                            borderTop: '1px solid var(--color-border)',
                            display: 'flex',
                            gap: 'var(--spacing-sm)'
                        }}
                    >
                        <input
                            type="text"
                            className="form-input"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Ask about HSM, signing, keys..."
                            style={{ flex: 1 }}
                        />
                        <button
                            onClick={handleSendMessage}
                            className="btn btn-primary btn-icon"
                            disabled={!chatInput.trim() || isTyping}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
