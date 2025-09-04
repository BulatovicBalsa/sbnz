// src/utils/time.ts
export const REAL_INTERVAL = 30_000; // 30s
export const SIM_INTERVAL = 5 * 60 * 1000; // 5min (real device interval)

// ratio: how much simulated time advances per real ms
export const TIME_SCALE = SIM_INTERVAL / REAL_INTERVAL;
