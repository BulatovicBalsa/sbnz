import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Brush, Legend } from 'recharts';
import type { GlucoseSample, TimelineEvent } from '../types';
import { withinLastHours } from '../utils/glucose';


interface Props {
    data: GlucoseSample[];
    hours: number;
    events: TimelineEvent[];
}


const formatTime = (ms: number) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });


export const GlucoseChart: React.FC<Props> = ({ data, hours, events }) => {
    const filtered = useMemo(() => data.filter(d => withinLastHours(d.t, hours)), [data, hours]);


    return (
        <div className="w-full h-[420px] bg-zinc-900/30 rounded-2xl p-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filtered} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="t" tickFormatter={formatTime} type="number" domain={['auto', 'auto']} />
                    <YAxis yAxisId="left" domain={[2, 16]} label={{ value: 'mmol/L', angle: -90, position: 'insideLeft' }} />
                    <Tooltip labelFormatter={(v) => formatTime(Number(v))} formatter={(v) => [`${v} mmol/L`, 'GL']} />
                    <Legend />


                    {/* CGM line */}
                    <Line yAxisId="left" type="monotone" dataKey="mmol" name="Glucose" dot={false} strokeWidth={2} />


                    {/* Thresholds */}
                    <ReferenceLine y={3.9} yAxisId="left" stroke="red" strokeDasharray="4 4" label={{ value: '3.9', position: 'insideTopLeft' }} />
                    <ReferenceLine y={9.9} yAxisId="left" stroke="gold" strokeDasharray="4 4" label={{ value: '9.9', position: 'insideTopLeft' }} />


                    {/* Events as vertical markers */}
                    {events.filter(e => withinLastHours(e.at, hours)).map(e => (
                        <ReferenceLine key={e.id} x={e.at} stroke={colorForEvent(e.type)} label={{ value: labelForEvent(e), position: 'top' }} />
                    ))}


                    <Brush dataKey="t" height={22} tickFormatter={formatTime} travellerWidth={8} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};


function colorForEvent(t: TimelineEvent['type']) {
    switch (t) {
        case 'FOOD': return 'orange';
        case 'INSULIN': return 'deepskyblue';
        case 'ACTIVITY': return 'limegreen';
        default: return 'white';
    }
}


function labelForEvent(e: TimelineEvent) {
    const s = e.amount != null ? ` (${e.amount})` : '';
    return `${e.type}${s}`;
}