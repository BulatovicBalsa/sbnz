import type {GlucoseTrend} from "@/types.ts";

export type CloseFn = () => void;

function resolve(urlOrBase: string, path: string) {
    // If a full ws url is provided (contains /ws/), use it as-is
    if (/^wss?:\/\//i.test(urlOrBase) && /\/ws\//.test(urlOrBase)) return urlOrBase;
    // Otherwise treat it as base and append path
    return `${urlOrBase.replace(/\/$/, "")}${path}`;
}

export function openGlucoseWS(
    urlOrBase: string,
    onMsg: (msg: { t: number; mmol: number }) => void
): CloseFn {
    const url = resolve(urlOrBase, "/ws/glucose");
    const ws = new WebSocket(url);
    ws.onmessage = (e) => { try { onMsg(JSON.parse(e.data)); } catch {console.error(e);} };
    return () => ws.close();
}

export function openSuggestionsWS(
    urlOrBase: string,
    onMsg: (msg: { at: number; text: string }) => void
): CloseFn {
    const url = resolve(urlOrBase, "/ws/suggestions");
    const ws = new WebSocket(url);
    ws.onmessage = (e) => { try { onMsg(JSON.parse(e.data)); } catch {console.error(e);} };
    return () => ws.close();
}

export function openTrendWS(
    urlOrBase: string,
    onMsg: (msg: { trend: GlucoseTrend }) => void
): CloseFn {
    const url = resolve(urlOrBase, "/ws/trends");
    const ws = new WebSocket(url);
    ws.onmessage = (e) => { try { onMsg(JSON.parse(e.data)); } catch {console.error(e);} };
    return () => ws.close();
}
