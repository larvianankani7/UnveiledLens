package com.unveiledlens.discovery;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class SerpApiService {

    @Value("${SERPAPI_KEY:#{null}}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<String> search(String query) {
        List<String> links = new ArrayList<>();
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("<already configured>")) {
            log.warn("SerpApi key is missing or not configured correctly.");
            return links;
        }

        try {
            String url = UriComponentsBuilder.fromHttpUrl("https://serpapi.com/search.json")
                    .queryParam("engine", "google")
                    .queryParam("q", query)
                    .queryParam("api_key", apiKey)
                    .queryParam("num", 10)
                    .build()
                    .toUriString();

            String response = restTemplate.getForObject(url, String.class);
            if (response != null) {
                JsonNode root = objectMapper.readTree(response);
                JsonNode organicResults = root.path("organic_results");
                if (organicResults.isArray()) {
                    for (JsonNode node : organicResults) {
                        String link = node.path("link").asText();
                        if (link != null && !link.isEmpty()) {
                            links.add(link);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to query SerpApi", e);
            throw new RuntimeException("SerpApi failure: " + e.getMessage());
        }
        return links;
    }
}
