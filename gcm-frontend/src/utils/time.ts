export const SPEED = 10;           // 1x, 2x, 10x, ...
const t0Real = Date.now(); // real wall clock when we (re)anchored
const t0Sim  = t0Real;     // simulated epoch at the same anchor moment

export function getTimeNow(): number {
    return t0Sim + (Date.now() - t0Real) * SPEED;
}

export const REAL_INTERVAL = 30_000; // 30s
export const SIM_INTERVAL = 5 * 60 * 1000; // 5min (real device interval)