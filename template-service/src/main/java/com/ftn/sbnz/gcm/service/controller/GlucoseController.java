package com.ftn.sbnz.gcm.service.controller;

import com.ftn.sbnz.gcm.model.models.GlucoseContext;
import com.ftn.sbnz.gcm.model.models.GlucoseMeasurement;
import com.ftn.sbnz.gcm.service.rules.GlucoseContextBuilder;
import com.ftn.sbnz.gcm.service.service.ClockService;
import com.ftn.sbnz.gcm.service.service.RuleEngineSession;
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
    private final RuleEngineSession ruleEngine;
    private final GlucoseContextBuilder ctxBuilder;
    private final ClockService clockService;

    @PostMapping
    public void receiveGlucoseData(@RequestBody GlucoseMessage message) {
        message.setT(clockService.now());
        glucoseHandler.send(message);

        double mmol = message.getMmol();
        long   tMillis = message.getT();

        GlucoseMeasurement gm = new GlucoseMeasurement(mmol, tMillis);
        System.out.println(gm);

        ruleEngine.evaluateAndPublish(gm);
    }
}
