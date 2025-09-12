package com.ftn.sbnz.gcm.model.models;

public class GlucoseTrendConfig {
    public double strongUpThreshold = 0.9;
    public double slightUpThreshold = 0.3;
    public double slightDownThreshold = -0.3;
    public double strongDownThreshold = -0.9;
    public double maxDeltaSpikeThreshold = 0.5;
    public double stableNetDeltaThreshold = 0.1;
}
