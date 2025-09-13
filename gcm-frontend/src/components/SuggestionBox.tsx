import React from 'react';
import type { SuggestionMessage } from '../types';
import { Card, CardContent } from "@/components/ui/card";

export const SuggestionBox: React.FC<{ suggestions: SuggestionMessage[] }> = ({ suggestions }) => (
    <Card className="flex flex-col justify-center items-center text-center overflow-y-auto">
        <CardContent className="space-y-3 w-full">
            {suggestions.length > 0 ? (
                suggestions.map((s, idx) => (
                    <div key={s.at} className="mb-2">
                        <div className="text-xl opacity-60 font-mono">
                            [{new Date(s.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}]
                        </div>
                        <div className="text-2xl font-semibold leading-snug">
                            {s.text}
                        </div>
                        {idx < suggestions.length - 1 && <hr className="my-2 opacity-20" />}
                    </div>
                ))
            ) : (
                <em className="opacity-70">Waiting for system suggestion…</em>
            )}
        </CardContent>
    </Card>
);
