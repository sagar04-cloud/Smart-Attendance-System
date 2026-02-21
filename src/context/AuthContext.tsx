import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, authenticateUser } from '../store/data';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string, role: UserRole) => boolean;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'qr_attendance_auth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(AUTH_STORAGE_KEY);
            if (stored) {
                setUser(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Auth restore error:', e);
        }
    }, []);

    const login = (email: string, password: string, role: UserRole): boolean => {
        const found = authenticateUser(email, password, role);
        if (found) {
            setUser(found);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(found));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
