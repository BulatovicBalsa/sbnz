package com.ftn.sbnz.gcm.model.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GlucoseContext {
    private double currentMmol;
    private double delta5min;
    private Long minutesSinceMeal;
    private Long minutesSinceInsulin;
}
