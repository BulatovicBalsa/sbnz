package com.ftn.sbnz.gcm.service.service;

import com.ftn.sbnz.gcm.model.enums.ActivityIntensity;
import com.ftn.sbnz.gcm.model.enums.GlycemicIndexType;
import com.ftn.sbnz.gcm.model.enums.TrendType;
import com.ftn.sbnz.gcm.model.models.*;
import com.ftn.sbnz.gcm.service.ws.SuggestionHandler;
import com.ftn.sbnz.gcm.service.ws.TrendHandler;
import com.google.common.base.Supplier;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.drools.template.ObjectDataCompiler;
import org.kie.api.KieBase;
import org.kie.api.KieBaseConfiguration;
import org.kie.api.KieServices;
import org.kie.api.conf.EventProcessingOption;
import org.kie.api.io.Resource;
import org.kie.api.io.ResourceType;
import org.kie.api.runtime.KieSession;
import org.kie.api.runtime.KieSessionConfiguration;
import org.kie.api.runtime.conf.ClockTypeOption;
import org.kie.api.time.SessionPseudoClock;
import org.kie.internal.io.ResourceFactory;
import org.kie.internal.utils.KieHelper;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RuleEngineSession {

    private final TrendHandler trendHandler;
    private final SuggestionHandler suggestionHandler;
    private final ClockService clockService;
    private KieSession kieSession;

    @PostConstruct
    public void initSession() {
        if (kieSession != null) {
            kieSession.dispose();
        }

        KieHelper kieHelper = new KieHelper();

        // Compile food recommendation template rules
        String foodDrl = loadTemplate("/rules/template.drl", this::loadFoodData);
        kieHelper.addContent(foodDrl, ResourceType.DRL);

        // Compile trend classification template rules
        String trendClassifyDrl = loadTemplate("/rules/trend-classify.drt", this::loadTrendClassifyData);
        kieHelper.addContent(trendClassifyDrl, ResourceType.DRL);

        // Compile "suggest if no food" fallback rules
        String suggestNoFoodDrl = loadTemplate("/rules/suggest-no-food.drt", this::loadSuggestNoFoodData);
        kieHelper.addContent(suggestNoFoodDrl, ResourceType.DRL);

        // Compile suggest-food rules
        String suggestFoodDrl = loadTemplate("/rules/suggest-food.drt", this::loadSuggestFoodData);
        kieHelper.addContent(suggestFoodDrl, ResourceType.DRL);

        // Add base rules
        InputStream basicRules = RuleEngineSession.class.getResourceAsStream("/rules/basic.drl");
        Resource basicResource = ResourceFactory.newInputStreamResource(basicRules);
        kieHelper.addResource(basicResource, ResourceType.DRL);

        KieBaseConfiguration kBaseConfig = KieServices.Factory.get().newKieBaseConfiguration();
        kBaseConfig.setOption(EventProcessingOption.STREAM);

        KieBase kBase = kieHelper.build(kBaseConfig);

        KieSessionConfiguration kSessionCfg = KieServices.Factory.get().newKieSessionConfiguration();
        kSessionCfg.setOption(ClockTypeOption.get("pseudo"));

        kieSession = kBase.newKieSession(kSessionCfg, null);

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

        kieSession.setGlobal("config", new GlucoseTrendConfig());
        kieSession.setGlobal("droolsClock", kieSession.getSessionClock());
    }

    public void evaluateAndPublish(GlucoseMeasurement gm, boolean shouldFire) {
        updateTime();

        kieSession.insert(gm);

        if (shouldFire)
            kieSession.fireAllRules();
    }

    public void insertEvent(TimelineEvent event) {
        updateTime();
        kieSession.insert(event);
        kieSession.fireAllRules();
    }

    private void updateTime() {
        SessionPseudoClock clock = kieSession.getSessionClock();
        long past = clockService.now() - clock.getCurrentTime();
        clock.advanceTime(past, java.util.concurrent.TimeUnit.MILLISECONDS);
    }


    @SneakyThrows
    private List<FoodRuleTemplate> loadFoodData() {
        InputStream csv = RuleEngineSession.class.getResourceAsStream("/rules/template-data.csv");
        assert csv != null;

        List<FoodRuleTemplate> templates = new java.util.ArrayList<>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(csv));

        String line;
        reader.readLine(); // Skip header

        while ((line = reader.readLine()) != null) {
            String[] parts = line.split(",");
            // Adjust constructor arguments as needed
            templates.add(new FoodRuleTemplate(
                Integer.parseInt(parts[0]),
                Double.parseDouble(parts[1]),
                Double.parseDouble(parts[2]),
                ActivityIntensity.valueOf(parts[3]),
                Double.parseDouble(parts[4]),
                Double.parseDouble(parts[5]),
                Double.parseDouble(parts[6]),
                GlycemicIndexType.valueOf(parts[7])
            ));
        }

        return templates;
    }

    @SneakyThrows
    private List<TrendClassifyTemplate> loadTrendClassifyData() {
        InputStream csv = RuleEngineSession.class.getResourceAsStream("/rules/trend-classify.csv");
        assert csv != null;

        List<TrendClassifyTemplate> templates = new java.util.ArrayList<>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(csv));

        String line;
        reader.readLine(); // Skip header

        while ((line = reader.readLine()) != null) {
            if (line.trim().isEmpty()) continue;
            String[] parts = line.split("\\|");
            templates.add(new TrendClassifyTemplate(
                parts[0],
                parts[1],
                TrendType.valueOf(parts[2]),
                Integer.parseInt(parts[3])
            ));
        }

        return templates;
    }

    @SneakyThrows
    private List<SuggestNoFoodTemplate> loadSuggestNoFoodData() {
        InputStream csv = RuleEngineSession.class.getResourceAsStream("/rules/suggest-no-food.csv");
        assert csv != null;

        List<SuggestNoFoodTemplate> templates = new java.util.ArrayList<>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(csv));

        String line;
        reader.readLine(); // Skip header
        while ((line = reader.readLine()) != null) {
            if (line.trim().isEmpty()) continue;
            String[] parts = line.split("\\|");
            templates.add(new SuggestNoFoodTemplate(
                parts[0],
                GlycemicIndexType.valueOf(parts[1]),
                parts[2],
                parts[3]
            ));
        }
        return templates;
    }

    @SneakyThrows
    private List<SuggestFoodTemplate> loadSuggestFoodData() {
        InputStream csv = RuleEngineSession.class.getResourceAsStream("/rules/suggest-food.csv");
        assert csv != null;

        List<SuggestFoodTemplate> templates = new java.util.ArrayList<>();
        BufferedReader reader = new BufferedReader(new InputStreamReader(csv));

        String line;
        reader.readLine(); // Skip header
        while ((line = reader.readLine()) != null) {
            if (line.trim().isEmpty()) continue;
            String[] parts = line.split("\\|");
            templates.add(new SuggestFoodTemplate(
                parts[0],
                GlycemicIndexType.valueOf(parts[1]),
                parts[2]
            ));
        }
        return templates;
    }

    // templateResourcePath, Action<List<T>> dataLoader) {
    private String loadTemplate(String templateResourcePath, Supplier<List<?>> dataLoader) {
        InputStream template = RuleEngineSession.class.getResourceAsStream(templateResourcePath);
        List<?> data = dataLoader.get();

        ObjectDataCompiler converter = new ObjectDataCompiler();
        return converter.compile(data, template);
    }
}