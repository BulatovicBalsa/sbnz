import { useEffect, useRef, useState } from 'react';


/** Minimal reconnecting WebSocket hook. If url is empty or MOCK is on, it stays idle. */
export function useReconnectingWS(url?: string) {
    const [connected, setConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);


    useEffect(() => {
        const USE_MOCK = import.meta.env.VITE_MOCK === '1';
        if (!url || USE_MOCK) return; // external code can simulate


        let shouldReconnect = true;


        function connect() {
            try {
                const ws = new WebSocket(url!);
                wsRef.current = ws;
                ws.onopen = () => setConnected(true);
                ws.onclose = () => { setConnected(false); if (shouldReconnect) setTimeout(connect, 1500); };
                ws.onerror = () => ws.close();
            } catch {
                console.error('[useReconnectingWS]', url);
                setConnected(false);
                setTimeout(connect, 1500);
            }
        }


        connect();
        return () => { shouldReconnect = false; wsRef.current?.close(); };
    }, [url]);


    return { wsRef, connected } as const;
}