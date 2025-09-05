import React from "react";
import type {FoodItem, TimelineEvent} from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CreateFoodDialog from "@/dialogs/CreateFoodDialog.tsx";
import FoodEventDialog from "@/dialogs/FoodEventDialog.tsx";
import InsulinShotDialog from "@/dialogs/InsulinShotDialog.tsx";
import ActivityDialog from "@/dialogs/ActivityDialog.tsx";

interface Props {
    onAdd: (evt: TimelineEvent) => void;
    onCreateFood: (food: FoodItem) => void; // persist to DB
}

export const ActionPanel: React.FC<Props> = ({ onAdd, onCreateFood }) => {
    return (
        <Card>
            <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <CreateFoodDialog onCreateFood={onCreateFood} />
                    <FoodEventDialog onAdd={onAdd} />
                    <InsulinShotDialog onAdd={onAdd} />
                    <ActivityDialog onAdd={onAdd} />
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">
                    Food & Insulin are recorded at the moment of insertion. Activity must be scheduled for now or later.
                </p>
            </CardContent>
        </Card>
    );
};
