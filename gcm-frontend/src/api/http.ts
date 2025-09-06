// Minimal fetch wrapper with auth + qs helpers
let AUTH_TOKEN: string | null = null;

export function setAuthToken(token: string | null) {
    AUTH_TOKEN = token;
}

const BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

function qs(params: Record<string, any> | undefined) {
    if (!params) return "";
    const u = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        u.set(k, String(v));
    });
    const s = u.toString();
    return s ? `?${s}` : "";
}

async function request<T>(
    path: string,
    opts: { method?: Method; body?: any; query?: Record<string, any> } = {}
): Promise<T> {
    const url = `${BASE}${path}${qs(opts.query)}`;
    const res = await fetch(url, {
        method: opts.method ?? "GET",
        headers: {
            "Content-Type": "application/json",
            ...(AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {}),
        },
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `${res.status} ${res.statusText}`);
    }
    return (await res.json()) as T;
}

export const http = {
    get: <T>(path: string, query?: Record<string, any>) =>
        request<T>(path, { method: "GET", query }),
    post: <T>(path: string, body?: any) =>
        request<T>(path, { method: "POST", body }),
    put:  <T>(path: string, body?: any) =>
        request<T>(path, { method: "PUT", body }),
    patch:<T>(path: string, body?: any) =>
        request<T>(path, { method: "PATCH", body }),
    delete:<T>(path: string, query?: Record<string, any>) =>
        request<T>(path, { method: "DELETE", query }),
};
