package com.ftn.sbnz.gcm.service.config;

import com.ftn.sbnz.gcm.service.ws.GlucoseHandler;
import com.ftn.sbnz.gcm.service.ws.SuggestionHandler;
import com.ftn.sbnz.gcm.service.ws.TrendHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final GlucoseHandler glucoseHandler;
    private final SuggestionHandler suggestionHandler;
    private  final TrendHandler trendHandler;

    public WebSocketConfig(GlucoseHandler g, SuggestionHandler s, TrendHandler t) {
        this.glucoseHandler = g; this.suggestionHandler = s; this.trendHandler = t;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(glucoseHandler, "/ws/glucose")
                .setAllowedOriginPatterns("*");     // allow all
        registry.addHandler(suggestionHandler, "/ws/suggestions")
                .setAllowedOriginPatterns("*");     // allow all
        registry.addHandler(trendHandler, "/ws/trends")
                .setAllowedOriginPatterns("*");     // allow all
    }
}
