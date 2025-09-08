package com.ftn.sbnz.gcm.model.utils;

import com.ftn.sbnz.gcm.model.enums.Trend;

public final class TrendUtil {
    private TrendUtil(){}

    public static Trend fromDelta(double d){
        if (Double.isNaN(d)) return Trend.UNKNOWN;
        if (d >= 0.35) return Trend.STRONG_RISE;
        if (d >= 0.12) return Trend.SOFT_RISE;
        if (d <= -0.35) return Trend.STRONG_FALL;
        if (d <= -0.12) return Trend.SOFT_FALL;
        return Trend.FLAT;
    }
}
