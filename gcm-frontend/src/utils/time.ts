import {toast} from "sonner";

const baseUrl = import.meta.env.VITE_API_BASE ?? "";

export const SPEED = 10;

let t0Real = Date.now();

// one-time init guard
let _initPromise: Promise<void> | null = null;

export function getTimeNow(): number {
    return t0Real + (Date.now() - t0Real) * SPEED;
}

export const REAL_INTERVAL = 30_000;         // 30s
export const SIM_INTERVAL  = 5 * 60 * 1000;  // 5min (real device interval)

export async function initClockFromServer(): Promise<void> {
    if (_initPromise) return _initPromise;

    const url = `${baseUrl}/clock/start`;

    _initPromise = (async () => {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

            // Expecting: { t0Real: number }
            const data = await res.json();
            const serverT0Real = Number(data?.t0Real);

            if (!Number.isFinite(serverT0Real)) {
                throw new Error("Invalid payload: missing t0Real");
            }

            // Anchor: pair local "now" with server's t0Real
            t0Real = serverT0Real;
        } catch {
            toast.error("Could not sync time with server, using local time.");
        }
    })();

    return _initPromise;
}
