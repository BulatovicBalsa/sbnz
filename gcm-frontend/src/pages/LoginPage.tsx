// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useAuth } from "../auth";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState<string | null>(null);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        try {
            setErr(null);
            await login(email, password);
        } catch (e: any) {
            setErr(e?.message ?? "Login failed");
        }
    }

    return (
        <div className="w-full p-6 flex justify-center">
            <Dialog open>
                <DialogContent
                    showCloseButton={false}
                    className="sm:max-w-[425px]"
                >
                    <DialogHeader className="p-4 pb-0">
                        <DialogTitle className="text-center">GCM — Sign in</DialogTitle>
                    </DialogHeader>
                    <Card className="shadow-none border-0">
                        <CardContent>
                            <form onSubmit={submit} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        autoFocus
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                {err && <div className="text-red-400 text-sm">{err}</div>}
                                <Button className="w-full" type="submit">
                                    Sign in
                                </Button>
                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    Mock mode enabled with VITE_MOCK=1 (any credentials).
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </DialogContent>
            </Dialog>
        </div>
    );
};
