package com.ftn.sbnz.gcm.service.config;

import com.ftn.sbnz.gcm.service.ws.GlucoseHandler;
import com.ftn.sbnz.gcm.service.ws.SuggestionsHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final GlucoseHandler glucoseHandler;
    private final SuggestionsHandler suggestionsHandler;

    public WebSocketConfig(GlucoseHandler g, SuggestionsHandler s) {
        this.glucoseHandler = g; this.suggestionsHandler = s;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(glucoseHandler, "/ws/glucose")
                .setAllowedOriginPatterns("*");     // allow all
        registry.addHandler(suggestionsHandler, "/ws/suggestions")
                .setAllowedOriginPatterns("*");     // allow all
    }
}
