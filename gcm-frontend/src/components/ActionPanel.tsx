import React, { useState } from 'react';
import type { EventType, TimelineEvent } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface Props { onAdd: (evt: TimelineEvent) => void; }

export const ActionPanel: React.FC<Props> = ({ onAdd }) => {
    const [type, setType] = useState<EventType>('FOOD');
    const [label, setLabel] = useState('');
    const [amount, setAmount] = useState<string>('');
    const [at, setAt] = useState(() => new Date().toISOString().slice(0,16));

    function submit() {
        const ts = new Date(at).getTime();
        const evt: TimelineEvent = {
            id: crypto.randomUUID(),
            type, label,
            amount: amount === '' ? undefined : Number(amount),
            at: ts
        };
        onAdd(evt);
        setLabel(''); setAmount(''); setAt(new Date().toISOString().slice(0,16));
    }

    return (
        <Card>
            <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-2">
                        <Label>Type</Label>
                        <Select value={type} onValueChange={v => setType(v as EventType)}>
                            <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FOOD">Food</SelectItem>
                                <SelectItem value="INSULIN">Insulin</SelectItem>
                                <SelectItem value="ACTIVITY">Activity</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                        <Label>Label</Label>
                        <Input placeholder={type==='FOOD' ? 'e.g. Banana' : 'Short note'} value={label} onChange={e => setLabel(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Amount</Label>
                        <Input type="number" step="0.1" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Time</Label>
                        <Input type="datetime-local" value={at} onChange={e => setAt(e.target.value)} />
                    </div>
                    <div className="col-span-2">
                        <Button className="w-full" onClick={submit} disabled={!label}>Add</Button>
                    </div>
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">Food can later open a richer dialog. All items are marked on the timeline.</p>
            </CardContent>
        </Card>
    );
};
