import React, { useState } from "react";
import type { TimelineEvent, EventType } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {getTimeNow} from "@/utils/time.ts";

interface Props { onAdd: (evt: TimelineEvent) => void; }

const InsulinShotDialog: React.FC<Props> = ({ onAdd }) => {
    const [open, setOpen] = useState(false);
    const [units, setUnits] = useState<string>("");

    function submit() {
        if (!units) return;
        const evt: TimelineEvent = {
            id: crypto.randomUUID(),
            type: "INSULIN" as EventType,
            label: "Insulin shot",
            amount: Number(units),
            at: getTimeNow()
        };
        onAdd(evt);
        setUnits("");
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
                <div className="space-y-1.5">
                    <Label>Units</Label>
                    <Input type="number" step="1" min="0" value={units} onChange={(e) => setUnits(e.target.value)} />
                </div>
                <DialogFooter>
                    <Button onClick={submit} disabled={!units}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InsulinShotDialog;
