package com.ftn.sbnz.gcm.service.ws;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GlucoseMessage {
    private long t;
    private double mmol;
}
