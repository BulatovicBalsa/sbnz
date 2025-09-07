package com.ftn.sbnz.gcm.service.ws;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GlucoseMessage {
    private long t;
    private double mmol;
}
