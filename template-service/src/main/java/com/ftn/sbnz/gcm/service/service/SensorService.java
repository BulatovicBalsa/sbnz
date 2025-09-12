package com.ftn.sbnz.gcm.service.service;

import com.ftn.sbnz.gcm.service.ws.GlucoseMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.RequestEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import java.net.URI;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SensorService {
    private final RestTemplate restTemplate;

    @Value("${agent.base-url:http://localhost:9001}")
    private String agentBaseUrl;

    public List<GlucoseMessage> fetchHistory(int minutes) {
        URI uri = UriComponentsBuilder.fromHttpUrl(agentBaseUrl)
                .path("/history")
                .queryParam("minutes", minutes)
                .build(true)
                .toUri();

        var req = RequestEntity.get(uri).build();
        var resp = restTemplate.exchange(req, new ParameterizedTypeReference<List<GlucoseMessage>>() {});

        assert resp.getBody() != null;
        resp.getBody().forEach(System.out::println);
        return resp.getBody();
    }
}
