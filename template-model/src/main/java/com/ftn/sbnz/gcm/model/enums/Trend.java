package com.ftn.sbnz.gcm.model.enums;

public enum Trend {
    STRONG_RISE("↑"), SOFT_RISE("↗"), FLAT("→"),
    SOFT_FALL("↘"), STRONG_FALL("↓"), UNKNOWN("");
    public final String arrow;
    Trend(String a){ this.arrow = a; }
}

