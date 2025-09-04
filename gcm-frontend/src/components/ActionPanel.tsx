import React, { useState } from 'react';
import type { EventType, TimelineEvent } from '../types';


interface Props {
    onAdd: (evt: TimelineEvent) => void;
}


export const ActionPanel: React.FC<Props> = ({ onAdd }) => {
    const [type, setType] = useState<EventType>('FOOD');
    const [label, setLabel] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [at, setAt] = useState(() => new Date().toISOString().slice(0,16)); // local YYYY-MM-DDTHH:mm


    function submit() {
        const ts = new Date(at).getTime();
        const evt: TimelineEvent = { id: crypto.randomUUID(), type, label, amount: amount === '' ? undefined : Number(amount), at: ts };
        onAdd(evt);
        setLabel(''); setAmount(''); setAt(new Date().toISOString().slice(0,16));
    }


    return (
        <div className="bg-zinc-900/30 rounded-2xl p-4 space-y-3">
            <h3 className="text-lg font-semibold">Actions</h3>
            <div className="grid grid-cols-2 gap-3">
                <label className="col-span-2 flex items-center gap-2">Type
                    <select className="flex-1" value={type} onChange={e => setType(e.target.value as EventType)}>
                        <option value="FOOD">Food</option>
                        <option value="INSULIN">Insulin</option>
                        <option value="ACTIVITY">Activity</option>
                    </select>
                </label>
                <label className="col-span-2 flex items-center gap-2">Label
                    <input className="flex-1" placeholder={type==='FOOD' ? 'e.g. Banana' : 'Short note'} value={label} onChange={e => setLabel(e.target.value)} />
                </label>
                <label className="flex items-center gap-2">Amount
                    <input type="number" step="0.1" value={amount} onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))} />
                </label>
                <label className="flex items-center gap-2">Time
                    <input type="datetime-local" value={at} onChange={e => setAt(e.target.value)} />
                </label>
                <button className="col-span-2 btn" onClick={submit} disabled={!label}>Add</button>
            </div>
            <p className="text-xs opacity-70">Adding food opens a quick form here (no DB yet). All items appear as markers on the timeline.</p>
        </div>
    );
};