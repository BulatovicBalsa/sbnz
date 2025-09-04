export type GlucoseSample = {
    t: number; // unix ms
    mmol: number; // glucose (mmol/L)
};


export type EventType = 'FOOD' | 'INSULIN' | 'ACTIVITY';


export interface TimelineEvent {
    id: string;
    type: EventType;
    at: number; // unix ms, when it happened (or planned)
    label: string; // food name / activity / short text
    amount?: number; // portions / insulin units / duration in min
}


export interface SuggestionMessage {
    at: number;
    text: string;
}


export interface User {
    name: string;
    surname: string;
    token: string;
}