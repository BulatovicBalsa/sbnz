package com.ftn.sbnz.gcm.model.models;

import com.ftn.sbnz.gcm.model.enums.TrendType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Trend {
    private TrendType direction;
    private int strength;

    public String toArrow() {
        switch (direction) {
            case STABLE:
                return "→";
            case UP:
                return strength == 1 ? "↑" : "↗";
            case DOWN:
                return strength == 1 ? "↓" : "↘";
            default:
                return "-";
        }
    }
}
