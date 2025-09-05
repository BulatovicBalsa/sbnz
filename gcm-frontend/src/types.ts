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

export interface FoodItem {
    id: string;
    name: string;
    carbs: number;          // grams per portion
    fats: number;           // grams per portion
    glycemicIndex: number;  // 0-100
}

export const FOOD_CATALOG: FoodItem[] = [
    { id: "banana",  name: "Banana",  carbs: 27, fats: 0.3, glycemicIndex: 51 },
    { id: "apple",   name: "Apple",   carbs: 25, fats: 0.2, glycemicIndex: 36 },
    { id: "oatmeal", name: "Oatmeal", carbs: 27, fats: 3.0, glycemicIndex: 55 },
    { id: "yogurt",  name: "Yogurt",  carbs: 17, fats: 3.5, glycemicIndex: 35 },
];
