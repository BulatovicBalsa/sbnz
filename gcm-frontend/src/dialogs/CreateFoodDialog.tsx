import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import type {FoodItem} from "@/types.ts";
import {food} from "@/api/endpoints.ts";
import {toast} from "sonner";

interface Props {
    onCreateFood: (food: FoodItem) => void; // send to DB layer
}

const CreateFoodDialog: React.FC<Props> = ({ onCreateFood }) => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [carbs, setCarbs] = useState<string>("");
    const [fats, setFats] = useState<string>("");
    const [gi, setGi] = useState<string>("");

    const giNum = gi === "" ? NaN : Number(gi);
    const canSubmit =
        name.trim().length > 0 &&
        carbs !== "" &&
        fats !== "" &&
        gi !== "" &&
        giNum >= 0 && giNum <= 100;

    function submit() {
        if (!canSubmit) return;
        const foodItem: FoodItem = {
            name: name.trim(),
            carbs: Number(carbs),
            fats: Number(fats),
            glycemicIndex: Number(gi),
        };
        food.create(foodItem).then(r => {
            if (r) onCreateFood(r);
            setName(""); setCarbs(""); setFats(""); setGi("");
            setOpen(false);
        }).catch(err => {
            toast.error("Failed to create food: " + JSON.parse(err.message).error);
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="w-full">Create Food</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Food</DialogTitle>
                    <DialogDescription>Define a food item with macros and GI.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 space-y-1.5">
                        <Label>Name</Label>
                        <Input placeholder="Banana" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Carbs (g)</Label>
                        <Input type="number" step="0.1" min="0" value={carbs} onChange={(e) => setCarbs(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <Label>Fats (g)</Label>
                        <Input type="number" step="0.1" min="0" value={fats} onChange={(e) => setFats(e.target.value)} />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                        <Label>Glycemic Index (0–100)</Label>
                        <Input type="number" step="1" min="0" max="100" value={gi} onChange={(e) => setGi(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={submit} disabled={!canSubmit}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateFoodDialog;
