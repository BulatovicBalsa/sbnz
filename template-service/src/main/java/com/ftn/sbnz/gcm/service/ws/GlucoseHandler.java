package com.ftn.sbnz.gcm.service.ws;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ftn.sbnz.gcm.service.service.ClockService;
import com.ftn.sbnz.gcm.service.service.SensorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
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
    private final SensorService sensorService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        sessions.add(session);

        List<GlucoseMessage> history = sensorService.fetchHistory(120);
        for (GlucoseMessage msg : history) {
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
