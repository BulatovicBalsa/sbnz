import React from 'react';
import type { SuggestionMessage } from '../types';


export const SuggestionBox: React.FC<{ current?: SuggestionMessage | null }>
    = ({ current }) => (
    <div className="bg-zinc-900/30 rounded-2xl p-4 h-[160px]">
        <h3 className="text-lg font-semibold mb-2">Suggestion</h3>
        <div className="text-sm leading-relaxed">
            {current ? (
                <>
                    <div className="opacity-60 text-xs">{new Date(current.at).toLocaleTimeString()}</div>
                    <div>{current.text}</div>
                </>
            ) : (<em className="opacity-70">Waiting for system suggestion…</em>)}
        </div>
    </div>
);