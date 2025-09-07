package com.ftn.sbnz.gcm.service.controller;

import com.ftn.sbnz.gcm.service.dto.ClockDto;
import com.ftn.sbnz.gcm.service.service.ClockService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/clock")
@RequiredArgsConstructor
public class ClockController {
    private final ClockService clockService;

    @GetMapping("/start" )
    public ClockDto getStartTime() {
        return new ClockDto(clockService.getT0Real());
    }

}
