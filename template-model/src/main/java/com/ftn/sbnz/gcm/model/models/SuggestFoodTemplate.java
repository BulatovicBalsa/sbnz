package com.ftn.sbnz.gcm.model.models;

import com.ftn.sbnz.gcm.model.enums.GlycemicIndexType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuggestFoodTemplate {
    private String name;
    private GlycemicIndexType giType;
    // Drools constraint fragment for Food.glycemicIndex depending on GI group
    private String giCondition;
}
