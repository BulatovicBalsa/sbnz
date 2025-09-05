import React, { useMemo, useState } from "react";
import {type TimelineEvent, type EventType, FOOD_CATALOG} from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { nowLocalIsoMinutes, toTs } from "@/utils/datetime";

interface Props {
    onAdd: (evt: TimelineEvent) => void;
}

const FoodEventDialog: React.FC<Props> = ({ onAdd }) => {
    const [open, setOpen] = useState(false);
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [at, setAt] = useState(nowLocalIsoMinutes());

    const total = useMemo(() => Object.values(counts).reduce((a, b) => a + b, 0), [counts]);
    const totalCarbs = useMemo(() =>
        Object.entries(counts).reduce((sum, [id, qty]) => {
            const item = FOOD_CATALOG.find(f => f.id === id);
            return sum + (item ? item.carbs * qty : 0);
        }, 0), [counts]);

    const inc = (id: string) => setCounts((m) => ({ ...m, [id]: (m[id] ?? 0) + 1 }));
    const dec = (id: string) => setCounts((m) => {
        const v = (m[id] ?? 0) - 1;
        const next = { ...m };
        if (v <= 0) delete next[id]; else next[id] = v;
        return next;
    });

    function submit() {
        if (total === 0) return;
        const parts = Object.entries(counts).map(([id, qty]) => {
            const item = FOOD_CATALOG.find(f => f.id === id)!;
            return `${item.name}×${qty}`;
        });
        const evt: TimelineEvent = {
            id: crypto.randomUUID(),
            type: "FOOD" as EventType,
            label: parts.join(", "),
            // if you want, you can keep total carbs in amount for fast math
            amount: Math.round(totalCarbs * 10) / 10,
            at: toTs(at),
        };
        onAdd(evt);
        setCounts({});
        setAt(nowLocalIsoMinutes());
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="w-full">Food Event</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Food Event</DialogTitle>
                    <DialogDescription>Select items and adjust quantities.</DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2">
                        {FOOD_CATALOG.map((f) => {
                            const qty = counts[f.id] ?? 0;
                            return (
                                <div key={f.id} className="flex items-center justify-between rounded-xl border p-2">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{f.name}</span>
                                        <span className="text-xs text-muted-foreground">
                      {f.carbs}g carbs • {f.fats}g fats • GI {f.glycemicIndex}
                    </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" variant="outline" onClick={() => dec(f.id)}>-</Button>
                                        <span className="w-8 text-center tabular-nums">{qty}</span>
                                        <Button size="sm" onClick={() => inc(f.id)}>+</Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-1.5">
                        <Label>Time</Label>
                        <Input type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} />
                    </div>

                    <Separator />
                    <div className="text-sm text-muted-foreground">
                        Total items: <span className="font-medium">{total}</span> •
                        Estimated carbs: <span className="font-medium">{Math.round(totalCarbs * 10) / 10} g</span>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={submit} disabled={total === 0}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FoodEventDialog;
