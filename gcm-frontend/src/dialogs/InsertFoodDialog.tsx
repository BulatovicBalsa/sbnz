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

interface Props {
    onAdd: (evt: TimelineEvent) => void;
}

const InsertFoodDialog: React.FC<Props> = ({ onAdd }) => {
    const [open, setOpen] = useState(false);
    const [label, setLabel] = useState("");
    const [amount, setAmount] = useState<string>("");
    const [at, setAt] = useState(nowLocalIsoMinutes());

    function submit() {
        const evt: TimelineEvent = {
            id: crypto.randomUUID(),
            type: "FOOD" as EventType,
            label: label.trim(),
            amount: amount === "" ? undefined : Number(amount),
            at: toTs(at),
        };
        onAdd(evt);
        setLabel(""); setAmount(""); setAt(nowLocalIsoMinutes());
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button variant="secondary" className="w-full">Insert Food</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Insert Food</DialogTitle>
                    <DialogDescription>Free-form note with optional amount.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <Label>Label</Label>
                        <Input placeholder="e.g. Banana" value={label} onChange={(e) => setLabel(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Amount</Label>
                            <Input type="number" step="0.1" value={amount} onChange={(e) => setAmount(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Time</Label>
                            <Input type="datetime-local" value={at} onChange={(e) => setAt(e.target.value)} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={submit} disabled={!label.trim()}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InsertFoodDialog;
