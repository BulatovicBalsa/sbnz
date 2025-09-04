import React, { useState } from 'react';
import { useAuth } from '../auth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState<string | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        try { setErr(null); await login(email, password); }
        catch (e: any) { setErr(e?.message ?? 'Login failed'); }
    }

    return (
        <div className="min-h-screen grid place-items-center p-6">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">GCM — Sign in</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        {err && <div className="text-red-400 text-sm">{err}</div>}
                        <Button className="w-full" type="submit">Sign in</Button>
                        <p className="text-xs text-muted-foreground text-center mt-1">Mock mode: VITE_MOCK=1</p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};
