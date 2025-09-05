import React, { useState } from "react";
import type { TimelineEvent, EventType } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { nowLocalIsoMinutes, toTs } from "@/utils/datetime";

type Intensity = "LOW" | "MED" | "HIGH";

interface Props { onAdd: (evt: TimelineEvent) => void; }

const ActivityDialog: React.FC<Props> = ({ onAdd }) => {
    const [open, setOpen] = useState(false);
    const [intensity, setIntensity] = useState<Intensity>("LOW");
    const [start, setStart] = useState(nowLocalIsoMinutes());
    const [durationMin, setDurationMin] = useState<string>("30");

    function submit() {
        const duration = Number(durationMin || "0");
        const evt: TimelineEvent = {
            id: crypto.randomUUID(),
            type: "ACTIVITY" as EventType,
            label: `${intensity} activity • ${duration} min`,
            amount: duration, // keep duration in amount (minutes)
            at: toTs(start),
        };
        onAdd(evt);
        setIntensity("LOW"); setStart(nowLocalIsoMinutes()); setDurationMin("30");
        setOpen(false);
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
                        <Label>Start</Label>
                        <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Duration (min)</Label>
                        <Input type="number" min="0" step="5" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={submit} disabled={!durationMin}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ActivityDialog;
