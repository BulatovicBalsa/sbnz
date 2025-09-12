package com.ftn.sbnz.gcm.model.models;

import com.ftn.sbnz.gcm.model.enums.ActivityIntensity;
import com.ftn.sbnz.gcm.model.enums.GlycemicIndexType;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class FoodRuleTemplate {
    private int number;
    private double glucoseMin;
    private double glucoseMax;
    private ActivityIntensity intensity;
    private double minCarbs;
    private double maxCarbs;
    private double maxFats;
    private GlycemicIndexType glycemicIndexType;

    public FoodRuleTemplate(int number, double glucoseMin, double glucoseMax, ActivityIntensity intensity, double minCarbs, double maxCarbs, double maxFats, GlycemicIndexType glycemicIndexType) {
        this.number = number;
        this.glucoseMin = glucoseMin;
        this.glucoseMax = glucoseMax;
        this.intensity = intensity;
        this.minCarbs = minCarbs;
        this.maxCarbs = maxCarbs;
        this.maxFats = maxFats;
        this.glycemicIndexType = glycemicIndexType;
    }
}
