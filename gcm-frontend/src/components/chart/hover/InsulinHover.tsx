import * as React from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { Syringe } from "lucide-react";

const clock = (t: number) =>
    new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

type Props = {
    at: number;
    units: number;
};

const InsulinHover: React.FC<Props> = ({ at, units }) => (
    <HoverCard openDelay={50}>
        <HoverCardTrigger asChild>
            <button
                className="inline-flex h-5 w-5 items-center justify-center rounded-full border bg-background text-violet-500 shadow-sm transition hover:scale-105"
                aria-label="Insulin event"
                style={{ borderColor: "rgba(139, 92, 246, .4)" }} // violet-500/40
            >
                <Syringe className="h-3.5 w-3.5" />
            </button>
        </HoverCardTrigger>

        <HoverCardContent side="top" align="center" className="w-56 p-3 text-xs">
            <div className="text-[13px] font-semibold">
                Insulin Shot <span className="text-muted-foreground">[{clock(at)}]</span>
            </div>

            <Separator className="my-2" />

            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Units:</span>
                <span className="font-mono tabular-nums">{units} U</span>
            </div>
        </HoverCardContent>
    </HoverCard>
);

export default InsulinHover;
