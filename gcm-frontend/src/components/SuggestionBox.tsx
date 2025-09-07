import React from 'react';
import type { SuggestionMessage } from '../types';
import { Card, CardContent } from "@/components/ui/card";

export const SuggestionBox: React.FC<{ current?: SuggestionMessage | null }>
    = ({ current }) => (
    <Card className="h-[160px] flex flex-col justify-center items-center text-center">
        <CardContent className="space-y-3">
            {current ? (
                <>
                    <div className="text-xl opacity-60 font-mono">
                        [{new Date(current.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}]
                    </div>
                    <div className="text-2xl font-semibold leading-snug">
                        {current.text}
                    </div>
                </>
            ) : (
                <em className="opacity-70">Waiting for system suggestion…</em>
            )}
        </CardContent>
    </Card>
);
