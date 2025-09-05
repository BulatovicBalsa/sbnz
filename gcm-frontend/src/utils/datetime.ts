import { getTimeNow } from "./time";

export const nowLocalIsoMinutes = (delay?: number) => {
    if (!delay) delay = 0;
    const ms = getTimeNow() + delay;
    const d = new Date(ms);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const isFutureOrNow = (isoLocal: string) => {
    const target = new Date(isoLocal).getTime();
    return target >= getTimeNow();
};
