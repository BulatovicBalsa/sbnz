import React, {useEffect, useState} from 'react';
import { useAuth } from './auth';
import {FOOD_CATALOG, type GlucoseSample, type SuggestionMessage, type TimelineEvent} from './types';
import { calcTrend } from './utils/glucose';
import { GlucoseChart } from './components/GlucoseChart';
import { ActionPanel } from './components/ActionPanel';
import { SuggestionBox } from './components/SuggestionBox';
import { useReconnectingWS } from './hooks/useReconnectingWS';
import {Button} from "@/components/ui/button.tsx";
import {ThemeProvider} from "@/components/theme-provider.tsx";
import {Separator} from "@/components/ui/separator.tsx";
// in Dashboard (App.tsx)
import { REAL_INTERVAL, SIM_INTERVAL } from "@/utils/time";


const GL_WS = import.meta.env.VITE_GL_WS as string | undefined; // e.g. ws://localhost:8000/ws/glucose
const SUG_WS = import.meta.env.VITE_SUG_WS as string | undefined; // e.g. ws://localhost:8000/ws/suggestions

export default function App() {
    const { user } = useAuth();
    if (!user) return <Shell><Content><div /></Content></Shell>; // rendered via LoginPage route in main
    return (
        <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
            <Dashboard />
        </ThemeProvider>
    );
}

function Dashboard() {
    const [simNow, setSimNow] = useState(() => Date.now());
    const { user, logout } = useAuth();

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

    useEffect(() => {
        if (!USE_MOCK) return;
        const id = setInterval(() => {
            const texts = [
                'Consider 10g fast carbs if trending ↓ and <4.5',
                'Walk 15 min in 30 min',
                'Bolus correction 1u suggested',
                'Hydrate: 200ml water'
            ];
            setSuggestion({ at: simNow, text: texts[Math.floor(Math.random() * texts.length)] });
        }, 30000);
        return () => clearInterval(id);
    }, [USE_MOCK, simNow]);

    const createSample = (t: number) => {
        const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

        let mmol = 6.5;
        mmol += (Math.random() - 0.5) * 1.3;
        mmol = clamp(mmol, 3, 12);
        return { t, mmol: +mmol.toFixed(1) };
    }

    useEffect(() => {
        if (!USE_MOCK) return;

        // 1) seed past 1h
        const baseNow = Date.now();

        const history: GlucoseSample[] = [];
        for (let i = 12; i >= 0; i--) {
            const t = baseNow - i * SIM_INTERVAL;
            const sample = createSample(t);
            history.push(sample);
            console.log(new Date(sample.t).toLocaleTimeString(), sample.mmol);
        }

        setSamples(history);
        setSimNow(baseNow);

        console.log("CAo")
        const intervalId = setInterval(() => {
            setSimNow(prevSimNow => {
                const nextTime = prevSimNow + SIM_INTERVAL;
                const nextSample = createSample(nextTime);

                console.log(new Date(nextSample.t).toLocaleTimeString(), nextSample.mmol);

                setSamples(prev => [...prev.slice(1), nextSample]);
                return nextTime;
            });
        }, REAL_INTERVAL);

        return () => clearInterval(intervalId);
    }, [USE_MOCK]);

    // Timeline events (from ActionPanel)
    const [events, setEvents] = useState<TimelineEvent[]>([]);
    function addEvent(e: TimelineEvent) { setEvents(prev => [...prev, e]); }
    function createFood(f: { id: string; name: string; carbs: number; fats: number; glycemicIndex: number; }) {
        FOOD_CATALOG.push(f);
    }

    const trend = calcTrend(samples);

    return (
        <Shell>
            <TopBar name={`${user!.name} ${user!.surname}`} onLogout={logout} simNow={simNow} />
            <Content>
                <div className="space-y-6">
                    <ActionPanel onAdd={addEvent} onCreateFood={createFood} />
                    <Separator />
                    <GlucoseChart data={samples} trend={trend} simNow={simNow} events={events} />
                    <Separator />
                    <SuggestionBox current={suggestion} />
                </div>
            </Content>
        </Shell>
    );
}

function Shell({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-zinc-950 text-zinc-100">{children}</div>; }
function Content({ children }: { children: React.ReactNode }) { return <div className="max-w-6xl mx-auto p-4 md:p-6">{children}</div>; }


function TopBar({ name, onLogout, simNow }: { name: string; onLogout: () => void; simNow: number }) {
    return (
        <div className="sticky top-0 z-10 backdrop-blur bg-background/70 border-b">
            <div className="max-w-6xl mx-auto p-3 flex items-center justify-between">
                <div className="font-bold tracking-wide">GCM</div>
                <div className="flex items-center gap-6">
                    {/* accelerated clock */}
                    <div className="font-mono opacity-80">
                        {new Date(simNow).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </div>
                    <div className="opacity-80">{name}</div>
                    <Button variant="outline" onClick={onLogout}>Logout</Button>
                </div>
            </div>
        </div>
    );
}