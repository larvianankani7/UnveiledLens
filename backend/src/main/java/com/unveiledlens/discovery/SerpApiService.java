package com.unveiledlens.discovery;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.unveiledlens.discovery.dto.SerpApiResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.util.UriComponentsBuilder;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class SerpApiService {
    private final String apiKey;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    public SerpApiService(ObjectMapper objectMapper, @Value("${serpapi.key:}") String apiKey, @Value("${serpapi.timeout-ms:5000}") int timeoutMillis) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(timeoutMillis);
        factory.setReadTimeout(timeoutMillis);
        this.restTemplate = new RestTemplate(factory);
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
    }
    public List<SerpApiResult> search(String query) {
        List<SerpApiResult> results = new ArrayList<>();
        if (apiKey == null || apiKey.isBlank() || apiKey.equals("<already configured>")) {
            log.warn("SerpApi key is missing.");
            return results;
        }
        try {
            String url = UriComponentsBuilder.fromHttpUrl("https://serpapi.com/search.json").queryParam("engine", "google").queryParam("q", query).queryParam("api_key", apiKey).queryParam("num", 10).build().toUriString();
            String response = restTemplate.getForObject(url, String.class);
            if (response == null || response.isBlank()) {
                log.warn("SerpApi returned an empty response for query: {}", query);
                return results;
            }
            JsonNode root = objectMapper.readTree(response);
            String searchStatus = root.path("search_metadata").path("status").asText("");
            String error = root.path("error").asText("");
            JsonNode organicResults = root.path("organic_results");
            int count = organicResults.isArray() ? organicResults.size() : 0;
            log.info("SerpApi: status={}, organicResults={}, query={}", searchStatus, count, query);
            if (!error.isBlank()) {
                log.warn("SerpApi error: {}", error);
            }
            if (!organicResults.isArray()) {return results;}
            for (JsonNode node : organicResults) {
                String link = node.path("link").asText("");
                if (link.isBlank()) {continue;}
                results.add(SerpApiResult.builder().url(link).title(node.path("title").asText("")).snippet(node.path("snippet").asText("")).build());
            }
        } catch (Exception e) {
            log.error("Failed to query SerpApi", e);
            throw new RuntimeException("SerpApi failure: " + e.getMessage(), e);
        }
        return results;
    }
}