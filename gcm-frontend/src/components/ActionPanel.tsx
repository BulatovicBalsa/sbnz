import React from "react";
import type { TimelineEvent } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import InsertFoodDialog from "@/dialogs/InsertFoodDialog";
import FoodEventDialog from "@/dialogs/FoodEventDialog";
import InsulinShotDialog from "@/dialogs/InsulinShotDialog.tsx";
import ActivityDialog from "@/dialogs/ActivityDialog.tsx";

interface Props { onAdd: (evt: TimelineEvent) => void; }

export const ActionPanel: React.FC<Props> = ({ onAdd }) => {
    return (
        <Card>
            <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <InsertFoodDialog onAdd={onAdd} />
                    <FoodEventDialog onAdd={onAdd} />
                    <InsulinShotDialog onAdd={onAdd} />
                    <ActivityDialog onAdd={onAdd} />
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">
                    All actions are recorded on the timeline. Food catalog items include carbs, fats, and GI.
                </p>
            </CardContent>
        </Card>
    );
};
