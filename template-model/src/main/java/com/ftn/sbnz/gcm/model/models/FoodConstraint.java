package com.ftn.sbnz.gcm.model.models;

import com.ftn.sbnz.gcm.model.enums.GlycemicIndexType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class FoodConstraint {
    private double minCarbs;
    private double maxCarbs;
    private double maxFats;
    private GlycemicIndexType glycemicIndexType;
}
