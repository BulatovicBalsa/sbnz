package com.ftn.sbnz.gcm.service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ClockDto {
    private long t0Real;

    public ClockDto(long t0Real) {
        this.t0Real = t0Real;
    }
}
