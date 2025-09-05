import * as React from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";

const clock = (t: number) =>
    new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

type Props = {
    start: number;
    end: number;
    intensity: "LOW" | "MED" | "HIGH";
    durationMin: number;
    color: string; // hex or CSS var
};

const ActivityHover: React.FC<Props> = ({ start, end, intensity, durationMin, color }) => (
    <HoverCard openDelay={50}>
        <HoverCardTrigger asChild>
            <div
                className="h-2 rounded-full shadow-sm"
                style={{ background: color, opacity: 0.85 }}
                aria-label="Activity interval"
                title={`Activity ${intensity} • ${durationMin} min`}
            />
        </HoverCardTrigger>
        <HoverCardContent side="top" align="center" className="w-64 p-3 text-xs">
            <div className="text-[13px] font-semibold">
                Activity <span className="text-muted-foreground">[{clock(start)}–{clock(end)}]</span>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Intensity:</span>
                <span className="font-semibold">{intensity}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-mono tabular-nums">{durationMin} min</span>
            </div>
        </HoverCardContent>
    </HoverCard>
);

export default ActivityHover;
