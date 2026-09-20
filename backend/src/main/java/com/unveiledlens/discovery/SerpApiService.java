
package com.unveiledlens.discovery;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.unveiledlens.discovery.dto.SerpApiResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class SerpApiService {

    @Value("${serpapi.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<SerpApiResult> search(String query) {

        List<SerpApiResult> results = new ArrayList<>();

        if (apiKey == null
                || apiKey.isBlank()
                || apiKey.equals("<already configured>")) {

            log.warn("SerpApi key is missing or not configured correctly.");
            return results;
        }

        try {

            String url =
                    UriComponentsBuilder
                            .fromHttpUrl("https://serpapi.com/search.json")
                            .queryParam("engine", "google")
                            .queryParam("q", query)
                            .queryParam("api_key", apiKey)
                            .queryParam("num", 10)
                            .build()
                            .toUriString();

            String response =
                    restTemplate.getForObject(
                            url,
                            String.class
                    );

            if (response == null || response.isBlank()) {
                return results;
            }

            JsonNode root =
                    objectMapper.readTree(response);

            JsonNode organicResults =
                    root.path("organic_results");

            if (!organicResults.isArray()) {
                return results;
            }

            for (JsonNode node : organicResults) {

                String link =
                        node.path("link").asText("");

                if (link.isBlank()) {
                    continue;
                }

                results.add(
                        SerpApiResult.builder()
                                .url(link)
                                .title(
                                        node.path("title")
                                                .asText("")
                                )
                                .snippet(
                                        node.path("snippet")
                                                .asText("")
                                )
                                .build()
                );
            }

        } catch (Exception e) {

            log.error(
                    "Failed to query SerpApi",
                    e
            );

            throw new RuntimeException(
                    "SerpApi failure: " + e.getMessage(),
                    e
            );
        }

        return results;
    }
}

