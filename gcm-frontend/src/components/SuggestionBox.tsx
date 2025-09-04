import React from 'react';
import type { SuggestionMessage } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const SuggestionBox: React.FC<{ current?: SuggestionMessage | null }>
    = ({ current }) => (
    <Card className="h-[160px]">
        <CardHeader><CardTitle>Suggestion</CardTitle></CardHeader>
        <CardContent className="text-sm leading-relaxed">
            {current ? (
                <>
                    <div className="opacity-60 text-xs">{new Date(current.at).toLocaleTimeString()}</div>
                    <div>{current.text}</div>
                </>
            ) : (<em className="opacity-70">Waiting for system suggestion…</em>)}
        </CardContent>
    </Card>
);
