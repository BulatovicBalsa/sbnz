package com.ftn.sbnz.gcm.service.ws;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class TrendHandler extends TextWebSocketHandler {
    private final ObjectMapper om = new ObjectMapper();
    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) { sessions.add(session); }
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) { sessions.remove(session); }
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {}

    public void send(Object payload) {
        sessions.forEach(s -> {
            try { s.sendMessage(new TextMessage(om.writeValueAsString(payload))); }
            catch (Exception ignored) {}
        });
    }
}
