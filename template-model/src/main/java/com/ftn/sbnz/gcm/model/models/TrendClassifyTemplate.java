package com.ftn.sbnz.gcm.model.models;

import com.ftn.sbnz.gcm.model.enums.TrendType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrendClassifyTemplate {
    private String name;
    private String condition;
    private TrendType trendType;
    private int strength;
}