package com.ftn.sbnz.gcm.service.rules;

import com.ftn.sbnz.gcm.model.models.GlucoseContext;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicReference;

@Service
@RequiredArgsConstructor
public class GlucoseContextBuilder {

    // Keep last reading to compute slope deterministically
    private final AtomicReference<Reading> prev = new AtomicReference<>();

    public GlucoseContext build(double mmol, long tMillis,
                                Long minsSinceMeal, Long minsSinceInsulin) {

        double delta5 = computeDelta5(mmol, tMillis);
        return new GlucoseContext(mmol, delta5, minsSinceMeal, minsSinceInsulin);
    }

    private double computeDelta5(double mmol, long tMillis){
        Reading p = prev.getAndSet(new Reading(mmol, tMillis));
        if (p == null) return Double.NaN;
        double dtMin = Math.max(0.001, (tMillis - p.tMillis) / 60000.0);
        double slopePerMin = (mmol - p.mmol) / dtMin;
        return slopePerMin * 5.0; // normalize to 5 minutes
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    private static class Reading {
        private double mmol;
        private long tMillis;
    }
}
