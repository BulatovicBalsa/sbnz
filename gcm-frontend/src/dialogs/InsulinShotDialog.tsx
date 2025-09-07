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
import {events} from "@/api/endpoints.ts";
import {toast} from "sonner";

interface Props { onAdd: (evt: TimelineEvent) => void; }

const InsulinShotDialog: React.FC<Props> = ({ onAdd }) => {
    const [open, setOpen] = useState(false);
    const [units, setUnits] = useState<string>("");

    function submit() {
        if (!units) return;
        const evt: TimelineEvent = {
            type: "INSULIN" as EventType,
            amount: Number(units),
            at: getTimeNow()
        };
        events.create(evt).then(r => {
            if (r) onAdd(r);
            setUnits("");
            setOpen(false);
        }).catch(e => {
            toast.error("Failed to create food event: " + JSON.parse(e.message).error);
        })
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
