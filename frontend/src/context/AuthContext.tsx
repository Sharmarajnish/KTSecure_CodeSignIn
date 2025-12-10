import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize auth state from localStorage synchronously
function getInitialAuthState(): { user: User | null; token: string | null } {
    try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            return { token: storedToken, user: JSON.parse(storedUser) };
        }
    } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
    return { user: null, token: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState(() => ({
        ...getInitialAuthState(),
        isLoading: false
    }));

    const login = useCallback((newToken: string, newUser: User) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setAuthState({ token: newToken, user: newUser, isLoading: false });
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({ token: null, user: null, isLoading: false });
    }, []);

    const contextValue = useMemo(() => ({
        user: authState.user,
        token: authState.token,
        isAuthenticated: !!authState.token,
        isLoading: authState.isLoading,
        login,
        logout
    }), [authState, login, logout]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
