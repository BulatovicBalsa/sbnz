package com.ftn.sbnz.gcm.service.controller;

import com.ftn.sbnz.gcm.service.ws.GlucoseHandler;
import com.ftn.sbnz.gcm.service.ws.GlucoseMessage;
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

    @PostMapping
    public void receiveGlucoseData(@RequestBody GlucoseMessage message) {
        glucoseHandler.send(message);
    }
}
