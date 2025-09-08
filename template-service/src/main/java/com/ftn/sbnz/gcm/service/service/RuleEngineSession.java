package com.ftn.sbnz.gcm.service.service;

import com.ftn.sbnz.gcm.model.enums.Trend;
import com.ftn.sbnz.gcm.model.models.GlucoseContext;
import com.ftn.sbnz.gcm.model.models.Suggestion;
import com.ftn.sbnz.gcm.model.models.SuggestionMessage;
import com.ftn.sbnz.gcm.model.models.TrendMessage;
import com.ftn.sbnz.gcm.service.ws.SuggestionHandler;
import com.ftn.sbnz.gcm.service.ws.TrendHandler;
import lombok.RequiredArgsConstructor;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RuleEngineSession {

    private final KieContainer kieContainer;
    private final TrendHandler trendHandler;
    private final SuggestionHandler suggestionHandler;
    private final ClockService clockService;

    public void evaluateAndPublish(GlucoseContext ctx) {
        KieSession ks = kieContainer.newKieSession("rulesSession");
        try {
            ks.registerChannel("trend", obj -> {
                Trend t = (Trend) obj;
                trendHandler.send(new TrendMessage(t.arrow));
            });
            ks.registerChannel("sugg", obj -> {
                Suggestion s = (Suggestion) obj;
                suggestionHandler.send(new SuggestionMessage(clockService.now(), s.getText()));
            });
            ks.setGlobal("trend", ks.getChannels().get("trend"));
            ks.setGlobal("sugg",  ks.getChannels().get("sugg"));

            ks.insert(ctx);
            ks.fireAllRules();
        } finally {
            ks.dispose();
        }
    }
}