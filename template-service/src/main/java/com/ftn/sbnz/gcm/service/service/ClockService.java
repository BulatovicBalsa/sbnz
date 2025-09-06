package com.ftn.sbnz.gcm.service.service;

import lombok.Getter;
import org.springframework.stereotype.Service;

@Service
public class ClockService {
    public enum Mode { REALTIME, SIM }

    private final Mode mode = Mode.SIM;
    @Getter private final long t0Real = System.currentTimeMillis();
    private final long t0Sim  = t0Real;

    public long now() {
        if (mode == Mode.REALTIME) return System.currentTimeMillis();
        double speed = 10.0;
        return t0Sim + Math.round((System.currentTimeMillis() - t0Real) * speed);
    }
}
