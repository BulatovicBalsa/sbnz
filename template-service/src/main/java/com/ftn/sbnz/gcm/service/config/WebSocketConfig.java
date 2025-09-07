package com.ftn.sbnz.gcm.service.config;

import com.ftn.sbnz.gcm.service.ws.GlucoseHandler;
import com.ftn.sbnz.gcm.service.ws.SuggestionsHandler;
import com.ftn.sbnz.gcm.service.ws.TrendHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final GlucoseHandler glucoseHandler;
    private final SuggestionsHandler suggestionsHandler;
    private  final TrendHandler trendHandler;

    public WebSocketConfig(GlucoseHandler g, SuggestionsHandler s, TrendHandler t) {
        this.glucoseHandler = g; this.suggestionsHandler = s; this.trendHandler = t;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(glucoseHandler, "/ws/glucose")
                .setAllowedOriginPatterns("*");     // allow all
        registry.addHandler(suggestionsHandler, "/ws/suggestions")
                .setAllowedOriginPatterns("*");     // allow all
        registry.addHandler(trendHandler, "/ws/trends")
                .setAllowedOriginPatterns("*");     // allow all
    }
}
