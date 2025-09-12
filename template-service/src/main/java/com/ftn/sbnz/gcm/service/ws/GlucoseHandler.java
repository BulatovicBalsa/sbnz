package com.ftn.sbnz.gcm.service.ws;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ftn.sbnz.gcm.model.models.GlucoseMeasurement;
import com.ftn.sbnz.gcm.service.service.RuleEngineSession;
import com.ftn.sbnz.gcm.service.service.SensorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class GlucoseHandler extends TextWebSocketHandler {
    private final ObjectMapper om = new ObjectMapper();
    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();
    private final SensorService sensorService;
    private final RuleEngineSession ruleEngineSession;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws IOException {
        sessions.add(session);

        fetchHistory(session);
    }

    private void fetchHistory(WebSocketSession session) throws IOException {
        ruleEngineSession.initSession();
        List<GlucoseMessage> history = sensorService.fetchHistory(120);
        for (GlucoseMessage msg : history) {
            if (session != null)
                session.sendMessage(new TextMessage(om.writeValueAsString(msg)));

            ruleEngineSession.evaluateAndPublish(new GlucoseMeasurement(msg.getMmol(), msg.getT()), false);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
    }

    // server doesn't expect inbound messages; ignore
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {}

    public void send(Object payload) {
        sessions.forEach(s -> {
            try { s.sendMessage(new TextMessage(om.writeValueAsString(payload))); }
            catch (Exception ignored) {}
        });
    }
}
