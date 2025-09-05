import * as React from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { Apple } from "lucide-react";

const clock = (t: number) =>
    new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

type Props = {
    at: number;
    carbs?: number;
    fats?: number;
};

const FoodHover: React.FC<Props> = ({ at, carbs, fats }) => (
    <HoverCard openDelay={50}>
        <HoverCardTrigger asChild>
            <button
                className="inline-flex h-5 w-5 items-center justify-center rounded-full border bg-background text-red-500 shadow-sm transition hover:scale-105"
                aria-label="Food event"
                style={{ borderColor: "rgba(249, 115, 22, .4)" }} // orange-500/40
            >
                <Apple className="h-3.5 w-3.5" />
            </button>
        </HoverCardTrigger>

        <HoverCardContent side="top" align="center" className="w-56 p-3 text-xs">
            <div className="text-[13px] font-semibold">
                Food Event <span className="text-muted-foreground">[{clock(at)}]</span>
            </div>

            <Separator className="my-2" />

            <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Carbs:</span>
                <span className="font-mono tabular-nums">
          {carbs != null ? `${Math.round(carbs * 10) / 10} g` : "—"}
        </span>
            </div>

            <div className="mt-1 flex items-center justify-between">
                <span className="text-muted-foreground">Fats:</span>
                <span className="font-mono tabular-nums">
          {fats != null ? `${Math.round(fats * 10) / 10} g` : "—"}
        </span>
            </div>
        </HoverCardContent>
    </HoverCard>
);

export default FoodHover;
