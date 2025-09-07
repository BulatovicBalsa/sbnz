package com.ftn.sbnz.gcm.service.ws;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ftn.sbnz.gcm.service.service.ClockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Component
@RequiredArgsConstructor
public class GlucoseHandler extends TextWebSocketHandler {
    private final ObjectMapper om = new ObjectMapper();
    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();
    private final ClockService clockService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        sessions.add(session);

        long now = clockService.now();
        long interval = 5 * 60 * 1000; // 5min steps
        int count = 60 / 5; // 12 samples

        double mmol = 6.5;
        Random rnd = ThreadLocalRandom.current();

        for (int i = count; i >= 0; i--) {
            long t = now - i * interval;
            mmol += (rnd.nextDouble() - 0.5) * 0.6;
            mmol = Math.max(3.0, Math.min(12.0, mmol));

            var msg = new GlucoseMessage(t, Math.round(mmol * 10.0) / 10.0);
            session.sendMessage(new TextMessage(om.writeValueAsString(msg)));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
    }

    // server doesn't expect inbound messages; ignore
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {}

    public Set<WebSocketSession> sessions() { return sessions; }

    public void send(Object payload) {
        sessions.forEach(s -> {
            try { s.sendMessage(new TextMessage(om.writeValueAsString(payload))); }
            catch (Exception ignored) {}
        });
    }
}
