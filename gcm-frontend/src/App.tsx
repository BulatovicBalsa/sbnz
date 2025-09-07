import React, {useEffect, useState} from 'react';
import { useAuth } from './auth';
import {FOOD_CATALOG, type FoodItem, type GlucoseSample, type SuggestionMessage, type TimelineEvent} from './types';
import { calcTrend } from './utils/glucose';
import { GlucoseChart } from './components/GlucoseChart';
import { ActionPanel } from './components/ActionPanel';
import { SuggestionBox } from './components/SuggestionBox';
import {Button} from "@/components/ui/button.tsx";
import {ThemeProvider} from "@/components/theme-provider.tsx";
import {Separator} from "@/components/ui/separator.tsx";
// in Dashboard (App.tsx)
import {getTimeNow, REAL_INTERVAL, SIM_INTERVAL} from "@/utils/time";
import {food} from "@/api/endpoints.ts";
import {events as eventsApi} from "@/api/endpoints.ts";
import {toast} from "sonner";
import {openGlucoseWS, openSuggestionsWS} from "@/api/ws.ts";


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
    const [simNow, setSimNow] = useState(() => getTimeNow());
    const { user, logout } = useAuth();

    // Glucose stream
    const [samples, setSamples] = useState<GlucoseSample[]>([]);
    const [suggestion, setSuggestion] = useState<SuggestionMessage | null>(null);

    const closeGlucoseRef = React.useRef<null | (() => void)>(null);
    const closeSugRef = React.useRef<null | (() => void)>(null);

    const [foodCatalog, setFoodCatalog] = useState<FoodItem[]>([]);
    const [events, setEvents] = useState<TimelineEvent[]>([]);

    const USE_MOCK = import.meta.env.VITE_MOCK === '1';

    useEffect(() => {
        food.get().then(f => setFoodCatalog(f)).catch(err => {
            toast.error("Failed to load food catalog, using built-in: " + JSON.parse(err.message).error);
            setFoodCatalog(FOOD_CATALOG);
        });

    }, [USE_MOCK]);

    useEffect(() => {
        eventsApi.list({from: getTimeNow() - 60 * 60 * 1000, to: getTimeNow() + 24 * 60 * 60 * 1000})
            .then(evts => {
                const e = [...evts.food, ...evts.insulin, ...evts.activity];
                setEvents(e);
            }).catch(err => toast.error("Failed to load events: " + JSON.parse(err.message).error));
    }, [USE_MOCK]);

    // Glucose WS
    useEffect(() => {
        if (USE_MOCK || !GL_WS) return;
        closeGlucoseRef.current?.();
        closeGlucoseRef.current = openGlucoseWS(GL_WS, (msg) => {
            console.log(msg);
            if (typeof msg?.t === 'number' && typeof msg?.mmol === 'number') {
                setSamples(prev => [...prev, { t: msg.t, mmol: msg.mmol }]);
            }
        });
        return () => closeGlucoseRef.current?.();
    }, [USE_MOCK]);

    // Suggestions WS
    useEffect(() => {
        if (USE_MOCK || !SUG_WS) return;
        closeSugRef.current?.();
        closeSugRef.current = openSuggestionsWS(SUG_WS, (msg) => {
            console.log(msg);
            if (typeof msg?.at === 'number' && typeof msg?.text === 'string') {
                setSuggestion(msg);
            }
        });
        return () => closeSugRef.current?.();
    }, [USE_MOCK]);

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
        const baseNow = getTimeNow();

        const history: GlucoseSample[] = [];
        for (let i = 12; i >= 0; i--) {
            const t = baseNow - i * SIM_INTERVAL;
            const sample = createSample(t);
            history.push(sample);
            console.log(new Date(sample.t).toLocaleTimeString(), sample.mmol);
        }

        setSamples(history);
        setSimNow(getTimeNow());

        const intervalId = setInterval(() => {
            const nextTime = getTimeNow();
            const nextSample = createSample(nextTime);

            console.log(new Date(nextSample.t).toLocaleTimeString(), nextSample.mmol);

            setSamples(prev => [...prev.slice(1), nextSample]);
            return nextTime;
        }, REAL_INTERVAL);

        const intervalClockId = setInterval(() => {
            setSimNow(getTimeNow());
        }, 6000);

        return () => {
            clearInterval(intervalId);
            clearInterval(intervalClockId);
        }
    }, [USE_MOCK]);

    // Timeline events (from ActionPanel)
    function addEvent(e: TimelineEvent) { setEvents(prev => [...prev, e]); }

    const trend = calcTrend(samples);

    return (
        <Shell>
            <TopBar name={`${user!.name} ${user!.surname}`} onLogout={logout} simNow={simNow} />
            <Content>
                <div className="space-y-6">
                    <ActionPanel onAdd={addEvent} foodCatalog={foodCatalog} onCreateFood={(f) => setFoodCatalog(fc => [...fc, f])} />
                    <Separator />
                    <GlucoseChart data={samples} trend={trend} simNow={simNow} events={events} foodCatalog={foodCatalog} />
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
                        {new Date(simNow).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="opacity-80">{name}</div>
                    <Button variant="outline" onClick={onLogout}>Logout</Button>
                </div>
            </div>
        </div>
    );
}