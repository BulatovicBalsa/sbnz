import React, { useState } from 'react';
import { useAuth } from '../auth';


export const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState<string | null>(null);


    async function submit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setErr(null);
            await login(email, password);
        } catch (e: any) {
            setErr(e?.message ?? 'Login failed');
        }
    }


    return (
        <div className="min-h-screen grid place-items-center p-6">
            <form onSubmit={submit} className="w-full max-w-sm bg-zinc-900/30 rounded-2xl p-6 space-y-4">
                <h1 className="text-2xl font-bold text-center">GCM — Sign in</h1>
                <label className="block">Email
                    <input className="w-full" type="email" autoFocus value={email} onChange={e => setEmail(e.target.value)} />
                </label>
                <label className="block">Password
                    <input className="w-full" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                </label>
                {err && <div className="text-red-400 text-sm">{err}</div>}
                <button className="btn w-full" type="submit">Sign in</button>
                <p className="text-xs opacity-70 text-center">Mock mode enabled with VITE_MOCK=1 (any credentials).</p>
            </form>
        </div>
    );
};