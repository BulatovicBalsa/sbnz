package com.ftn.sbnz.gcm.service.service;

import com.ftn.sbnz.gcm.service.ws.GlucoseHandler;
import com.ftn.sbnz.gcm.service.ws.GlucoseMessage;
import com.ftn.sbnz.gcm.service.ws.SuggestionsHandler;
import lombok.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class StreamPushService {
    private final ClockService clock;
    private final GlucoseHandler glucoseHandler;
    private final SuggestionsHandler suggestionsHandler;

    private static final String[] SUG = {
            "Consider 10g fast carbs if trending ↓ and <4.5",
            "Walk 15 min in 30 min",
            "Bolus correction 1u suggested",
            "Hydrate: 200ml water"
    };

    private int i = 0;

    @Scheduled(fixedDelay = 10000) // every 30s
    public void pushSuggestions() {
        String text = SUG[i % SUG.length]; i++;
        suggestionsHandler.send(new SuggestionMsg(clock.now(), text));
    }

    @Data
    @AllArgsConstructor
    static class SuggestionMsg {
        private long at;
        private String text;
    }
}
