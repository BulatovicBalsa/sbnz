import React, { createContext, useContext, useState } from 'react';
import type { User } from './types.ts';


interface AuthCtx {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}


const AuthContext = createContext<AuthCtx | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const raw = localStorage.getItem('gcm_user');
        return raw ? JSON.parse(raw) as User : null;
    });


    async function login(email: string, password: string) {
// Mock mode by default. Replace with your API call when backend is ready.
        const USE_MOCK = import.meta.env.VITE_MOCK === '1';
        if (USE_MOCK) {
            const fakeUser: User = { name: 'Balsa', surname: 'Bulatovic', token: 'mock-token' };
            setUser(fakeUser);
            localStorage.setItem('gcm_user', JSON.stringify(fakeUser));
            return;
        }
// Example real call:
        const resp = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!resp.ok) throw new Error('Login failed');
        const data = await resp.json();
        const u: User = { name: data.name, surname: data.surname, token: data.token };
        setUser(u);
        localStorage.setItem('gcm_user', JSON.stringify(u));
    }


    function logout() {
        setUser(null);
        localStorage.removeItem('gcm_user');
    }


    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};


export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}