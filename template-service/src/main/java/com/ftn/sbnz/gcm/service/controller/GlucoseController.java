package com.ftn.sbnz.gcm.service.controller;

import com.ftn.sbnz.gcm.service.ws.GlucoseHandler;
import com.ftn.sbnz.gcm.service.ws.GlucoseMessage;
import com.ftn.sbnz.gcm.service.ws.TrendHandler;
import com.ftn.sbnz.gcm.service.ws.TrendMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/glucose")
@RequiredArgsConstructor
public class GlucoseController {
    private final GlucoseHandler glucoseHandler;
    private final TrendHandler trendHandler;

    @PostMapping
    public void receiveGlucoseData(@RequestBody GlucoseMessage message) {
        glucoseHandler.send(message);

        Random random = new Random();
        List<String> trends = List.of("↑", "→", "↓", "↗", "↘");
        TrendMessage trendMessage = new TrendMessage(trends.get(random.nextInt(trends.size())));
        trendHandler.send(trendMessage);
    }
}
