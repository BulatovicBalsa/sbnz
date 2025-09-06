import type {
    FoodItem,
    TimelineEvent,
    EventType,
} from "@/types";
import { http, setAuthToken } from "./http";
import { getTimeNow } from "@/utils/time";
import { isFutureOrNow } from "@/utils/datetime";

export { setAuthToken }; // re-export for convenience

// ------------ Food ------------
export const food = {
    get: () => http.get<FoodItem[]>("/api/food"),
    create: (f: Omit<FoodItem, "id">) =>
        http.post<FoodItem>("/api/food", f),
};

// ------------ Events ------------
type ListEventsQuery = {
    from?: number;          // ms epoch
    to?: number;            // ms epoch
    types?: EventType[];    // e.g. ["FOOD","INSULIN"]
};

export const events = {
    list: (q?: ListEventsQuery) =>
        http.get<TimelineEvent[]>("/api/events", {
            from: q?.from,
            to: q?.to,
            types: q?.types?.join(","),
        }),

    /**
     * Create a TimelineEvent with client-side defaults/validation:
     * - FOOD/INSULIN: if 'at' missing, stamp with getTimeNow()
     * - ACTIVITY: requires positive 'amount' (duration min) and future 'at'
     */
    create: (e: Omit<TimelineEvent, "id">) => {
        const payload = { ...e };

        if (payload.type === "FOOD" || payload.type === "INSULIN") {
            if (payload.at == null) payload.at = getTimeNow();
        } else if (payload.type === "ACTIVITY") {
            if (payload.amount == null || payload.amount <= 0) {
                return Promise.reject(new Error("Activity requires positive 'amount' (duration in minutes)."));
            }
            if (payload.at == null) {
                return Promise.reject(new Error("Activity requires 'at' (start time)."));
            }
            // guard with simulated/realtime now
            const iso = new Date(payload.at).toISOString();
            if (!isFutureOrNow(iso)) {
                return Promise.reject(new Error("Activity cannot start in the past."));
            }
        }

        return http.post<TimelineEvent>("/api/events", payload);
    },

    // Optional: add if/when your backend supports them
    update: (id: string, patch: Partial<Omit<TimelineEvent, "id">>) =>
        http.patch<TimelineEvent>(`/api/events/${id}`, patch),

    delete: (id: string) =>
        http.delete<{ ok: true }>(`/api/events/${id}`),
};
