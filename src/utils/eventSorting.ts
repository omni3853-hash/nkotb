import { Event } from "@/api/events.api";

const toEventDate = (event: Event): Date | null => {
    const rawDate = (event as any).date;
    const rawTime = (event as any).time;

    if (rawDate instanceof Date) return rawDate;

    if (typeof rawDate === "string" && rawDate.trim().length > 0) {
        if (typeof rawTime === "string" && rawTime.trim().length > 0) {
            return new Date(`${rawDate}T${rawTime}`);
        }
        return new Date(rawDate);
    }

    return null;
};

export const sortEventsByClosestDate = (events: Event[]): Event[] => {
    const now = new Date().getTime();

    return [...events].sort((a, b) => {
        const dateA = toEventDate(a);
        const dateB = toEventDate(b);

        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        const diffA = Math.abs(dateA.getTime() - now);
        const diffB = Math.abs(dateB.getTime() - now);

        if (diffA !== diffB) {
            // smaller difference from "now" comes first
            return diffA - diffB;
        }

        // tie-breaker: more recent date first
        return dateB.getTime() - dateA.getTime();
    });
};