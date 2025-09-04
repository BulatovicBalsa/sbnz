import React, { useEffect, useState } from 'react';
import { useAuth } from './auth';
import type { GlucoseSample, SuggestionMessage, TimelineEvent } from './types';
import { calcTrend } from './utils/glucose';
import { GlucoseChart } from './components/GlucoseChart';
import { ActionPanel } from './components/ActionPanel';
import { SuggestionBox } from './components/SuggestionBox';
import { useReconnectingWS } from './hooks/useReconnectingWS';

const GL_WS = import.meta.env.VITE_GL_WS as string | undefined; // e.g. ws://localhost:8000/ws/glucose
const SUG_WS = import.meta.env.VITE_SUG_WS as string | undefined; // e.g. ws://localhost:8000/ws/suggestions

export default function App() {
    const { user } = useAuth();
    if (!user) return <Shell><Content><div /></Content></Shell>; // rendered via LoginPage route in main
    return <Dashboard />;
}

function Dashboard() {
    const { user, logout } = useAuth();
    const [hours, setHours] = useState(6);

    // Glucose stream
    const [samples, setSamples] = useState<GlucoseSample[]>([]);
    const { wsRef: glWS, connected: glConnected } = useReconnectingWS(GL_WS);


// Suggestions stream
    const [suggestion, setSuggestion] = useState<SuggestionMessage | null>(null);
    const { wsRef: sugWS, connected: sugConnected } = useReconnectingWS(SUG_WS);


    const USE_MOCK = import.meta.env.VITE_MOCK === '1';

    // Incoming messages (real WebSocket)
    useEffect(() => {
        if (USE_MOCK) return;
        const ws = glWS.current;
        if (!ws) return;
        ws.onmessage = (ev) => {
            try {
                const msg = JSON.parse(ev.data);
                // Expect { t: unix_ms, mmol: number }
                if (typeof msg?.t === 'number' && typeof msg?.mmol === 'number') {
                    setSamples(prev => [...prev, { t: msg.t, mmol: msg.mmol }]);
                }
            } catch {
                console.error('Invalid glucose message', ev.data);
            }
        };
    }, [glWS, USE_MOCK]);

    useEffect(() => {
        if (USE_MOCK) return;
        const ws = sugWS.current; if (!ws) return;
        ws.onmessage = (ev) => {
            try {
                const msg = JSON.parse(ev.data);
                // Expect { at, text }
                if (typeof msg?.at === 'number' && typeof msg?.text === 'string') {
                    setSuggestion(msg as SuggestionMessage);
                }
            } catch {
                console.error('Invalid suggestion message', ev.data);
            }
        };
    }, [sugWS, USE_MOCK]);

    // Mock streams for development
    useEffect(() => {
        if (!USE_MOCK) return;
        // generate CGM every 5s
        let current = 6.5 + (Math.random() - 0.5);
        const id = setInterval(() => {
            current += (Math.random() - 0.5) * 0.3; // random walk
            current = Math.max(2.5, Math.min(15.5, current));
            setSamples(prev => [...prev, { t: Date.now(), mmol: Number(current.toFixed(1)) }]);
        }, 5000);
        return () => clearInterval(id);
    }, [USE_MOCK]);

    useEffect(() => {
        if (!USE_MOCK) return;
        const id = setInterval(() => {
            const texts = [
                'Consider 10g fast carbs if trending ↓ and <4.5',
                'Walk 15 min in 30 min',
                'Bolus correction 1u suggested',
                'Hydrate: 200ml water'
            ];
            setSuggestion({ at: Date.now(), text: texts[Math.floor(Math.random() * texts.length)] });
        }, 30000);
        return () => clearInterval(id);
    }, [USE_MOCK]);

    // Timeline events (from ActionPanel)
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    function addEvent(e: TimelineEvent) { setEvents(prev => [...prev, e]); }


    const trend = calcTrend(samples);

    return (
        <Shell>
            <TopBar name={`${user!.name} ${user!.surname}`} onLogout={logout} />
            <Content>
                <div className="grid gap-4 md:grid-cols-[240px_1fr_300px]">
                    <div className="space-y-4">
                        <SuggestionBox current={suggestion} />
                        <div className="bg-zinc-900/30 rounded-2xl p-4 text-sm">
                            <div className="font-semibold mb-2">Status</div>
                            <div>CGM: {glConnected || USE_MOCK ? 'connected' : 'offline'}</div>
                            <div>Suggestions: {sugConnected || USE_MOCK ? 'connected' : 'offline'}</div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xl font-semibold">Glucose (last <input className="w-14 text-center" type="number" min={1} max={48} value={hours} onChange={e => setHours(Number(e.target.value)||6)} /> h) — Trend {trend}</div>
                        </div>
                        <GlucoseChart data={samples} hours={hours} events={events} />
                    </div>
                    <ActionPanel onAdd={addEvent} />
                </div>
            </Content>
        </Shell>
    );
}

function Shell({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-zinc-950 text-zinc-100">{children}</div>; }
function Content({ children }: { children: React.ReactNode }) { return <div className="max-w-6xl mx-auto p-4 md:p-6">{children}</div>; }


function TopBar({ name, onLogout }: { name: string; onLogout: () => void }) {
    return (
        <div className="sticky top-0 z-10 backdrop-blur bg-zinc-950/70 border-b border-zinc-800">
            <div className="max-w-6xl mx-auto p-3 flex items-center justify-between">
                <div className="font-bold tracking-wide">GCM</div>
                <div className="flex items-center gap-3">
                    <div className="opacity-80">{name}</div>
                    <button className="btn" onClick={onLogout}>Logout</button>
                </div>
            </div>
        </div>
    );
}