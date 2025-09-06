import React, { useMemo, useState } from "react";
import type { TimelineEvent, EventType } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { nowLocalIsoMinutes, isFutureOrNow } from "@/utils/datetime";
import {events} from "@/api/endpoints.ts";
import {toast} from "sonner";

type Intensity = "LOW" | "MED" | "HIGH";

interface Props { onAdd: (evt: TimelineEvent) => void; }

const ActivityDialog: React.FC<Props> = ({ onAdd }) => {
    const [open, setOpen] = useState(false);
    const [intensity, setIntensity] = useState<Intensity>("LOW");
    const [start, setStart] = useState(nowLocalIsoMinutes(10 * 60 * 1000)); // default 10min in future
    const [durationMin, setDurationMin] = useState<string>("30");

    // keep min updated on each open
    const minStart = useMemo(() => nowLocalIsoMinutes(), [open]);

    function submit() {
        if (!durationMin) return;
        if (!isFutureOrNow(start)) return; // hard guard: cannot insert in the past
        const duration = Number(durationMin || "0");
        const evt: TimelineEvent = {
            type: "ACTIVITY" as EventType,
            label: `${intensity} activity • ${duration} min`,
            amount: duration,
            at: new Date(start).getTime(),
        };
        events.create(evt).then(r => {
            if (r) onAdd(r);
            setIntensity("LOW"); setStart(nowLocalIsoMinutes()); setDurationMin("30");
            setOpen(false);
        }).catch(e => toast.error('Failed to create activity event: ' + e.message));
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="w-full">Activity</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Activity</DialogTitle>
                    <DialogDescription>Choose intensity, start time, and duration.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1.5">
                        <Label>Intensity</Label>
                        <Select value={intensity} onValueChange={(v) => setIntensity(v as Intensity)}>
                            <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="LOW">Low</SelectItem>
                                <SelectItem value="MED">Medium</SelectItem>
                                <SelectItem value="HIGH">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label>Start (future only)</Label>
                        <Input type="datetime-local" min={minStart} value={start} onChange={(e) => setStart(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Duration (min)</Label>
                        <Input type="number" min="0" step="5" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={submit} disabled={!durationMin || !isFutureOrNow(start)}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ActivityDialog;
