package com.ftn.sbnz.gcm.service.controller;

import com.ftn.sbnz.gcm.service.ws.GlucoseHandler;
import com.ftn.sbnz.gcm.service.ws.GlucoseMessage;
import com.ftn.sbnz.gcm.service.ws.TrendHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/glucose")
@RequiredArgsConstructor
public class GlucoseController {
    private final GlucoseHandler glucoseHandler;
    private final TrendHandler trendHandler;

    @PostMapping
    public void receiveGlucoseData(@RequestBody GlucoseMessage message) {
        glucoseHandler.send(message);
        trendHandler.send(message);
    }
}
