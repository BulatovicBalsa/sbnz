import React, { useState } from "react";
import type { TimelineEvent, EventType } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { nowLocalIsoMinutes, toTs } from "@/utils/datetime";

interface Props { onAdd: (evt: TimelineEvent) => void; }

const InsulinShotDialog: React.FC<Props> = ({ onAdd }) => {
    const [open, setOpen] = useState(false);
    const [units, setUnits] = useState<string>("");
    const [at, setAt] = useState(nowLocalIsoMinutes());

    function submit() {
        if (!units) return;
        const evt: TimelineEvent = {
            id: crypto.randomUUID(),
            type: "INSULIN" as EventType,
            label: "Insulin shot",
            amount: Number(units),
            at: toTs(at),
        };
        onAdd(evt);
        setUnits(""); setAt(nowLocalIsoMinutes());
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="w-full">Insulin Shot</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Insulin Shot</DialogTitle>
                    <DialogDescription>Record the number of units taken.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label>Units</Label>
                        <Input type="number" step="0.5" min="0" value={units} onChange={(e) => setUnits(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Time</Label>
                        <Input type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={submit} disabled={!units}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InsulinShotDialog;
