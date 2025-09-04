import type { GlucoseSample } from '../types';


export function calcTrend(samples: GlucoseSample[]): '↑' | '↓' | '→' {
    if (samples.length < 4) return '→';
    const last = samples.slice(-6); // ~last 6 points
    const x = last.map((_d, i) => i);
    const y = last.map(d => d.mmol);
    const n = x.length;
    const xMean = x.reduce((a, b) => a + b, 0) / n;
    const yMean = y.reduce((a, b) => a + b, 0) / n;
    const num = x.reduce((acc, xi, i) => acc + (xi - xMean) * (y[i] - yMean), 0);
    const den = x.reduce((acc, xi) => acc + Math.pow(xi - xMean, 2), 0) || 1;
    const slope = num / den; // sign only matters here
    if (slope > 0.01) return '↑';
    if (slope < -0.01) return '↓';
    return '→';
}


export function withinLastHours(t: number, hours: number) {
    const cutoff = Date.now() - hours * 3600_000;
    return t >= cutoff;
}