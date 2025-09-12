package com.ftn.sbnz.gcm.service.service;

import com.ftn.sbnz.gcm.model.models.*;
import com.ftn.sbnz.gcm.service.ws.SuggestionHandler;
import com.ftn.sbnz.gcm.service.ws.TrendHandler;
import lombok.RequiredArgsConstructor;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.KieSession;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
public class RuleEngineSession {

    private final KieContainer kieContainer;
    private final TrendHandler trendHandler;
    private final SuggestionHandler suggestionHandler;
    private final ClockService clockService;
    private KieSession kieSession;

    @PostConstruct
    public void initSession() {
        if (kieSession != null) {
            kieSession.dispose();
        }

        kieSession = kieContainer.newKieSession("rulesSession");
        kieSession.registerChannel("trend", obj -> {
            Trend t = (Trend) obj;
            System.out.println(t);
            trendHandler.send(new TrendMessage(t.toArrow()));
        });
        kieSession.registerChannel("sugg", obj -> {
            Suggestion s = (Suggestion) obj;
            suggestionHandler.send(new SuggestionMessage(clockService.now(), s.getText()));
        });

        kieSession.setGlobal("trend", kieSession.getChannels().get("trend"));
        kieSession.setGlobal("sugg",  kieSession.getChannels().get("sugg"));

        kieSession.setGlobal("stableBandMgPerMin", 0.3);
        kieSession.setGlobal("fastRateMgPerMin", 0.6);
    }

    public void evaluateAndPublish(GlucoseMeasurement gm) {
        if (kieSession == null) {
            return;
        }
        kieSession.insert(gm);
        kieSession.fireAllRules();
    }
}