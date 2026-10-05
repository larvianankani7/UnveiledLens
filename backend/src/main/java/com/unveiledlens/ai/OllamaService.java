package com.unveiledlens.ai;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.HashMap;
import java.util.Map;
import java.time.Duration;

@Service
public class OllamaService {
    private final ObjectMapper objectMapper;
    private final WebClient client;
    private final String model;
    private final Duration timeout;
    private final int maxTokens;
    public OllamaService(
            ObjectMapper objectMapper,
            @Value("${ollama.url:http://localhost:11434}") String ollamaUrl,
            @Value("${ollama.model:llama3}") String model,
            @Value("${ollama.timeout-ms:5000}") long timeoutMillis,
            @Value("${ollama.max-tokens:96}") int maxTokens) {
        this.objectMapper = objectMapper;
        this.client = WebClient.builder().baseUrl(ollamaUrl).build();
        this.model = model;
        this.timeout = Duration.ofMillis(timeoutMillis);
        this.maxTokens = maxTokens;}
    public String generateInterpretation(String category, String evidence) {
        return generateInterpretation(category, evidence, false);}
    public String generateInterpretation(String category, String evidence, boolean authRequired) {
        String prompt = buildPrompt(category, evidence, authRequired);
        try {Map<String, Object> request = new HashMap<>();
            request.put("model", model);
            request.put("prompt", prompt);
            request.put("stream", false);
            request.put("options", Map.of("num_predict", maxTokens, "temperature", 0));
            String response =
                    client.post()
                            .uri("/api/generate")
                            .contentType(MediaType.APPLICATION_JSON)
                            .bodyValue(request)
                            .retrieve()
                            .bodyToMono(String.class)
                            .block(timeout);
            if (response == null || response.isBlank()) {
                return fallbackInterpretation(category, authRequired);}
            JsonNode json = objectMapper.readTree(response);
            JsonNode generated = json.get("response");
            if (generated == null || generated.asText().isBlank()) {
                return fallbackInterpretation(category, authRequired);}
            return generated.asText().trim();
        } catch (Exception e) {
            return fallbackInterpretation(category, authRequired);}}
    private String buildPrompt(String category, String evidence, boolean authRequired ) {
        return """
                Write one concise, factual security-report interpretation.
                Do not claim exploitation, invent facts, suggest bypasses, or give attack instructions.
                Category: %s
                Authentication required: %s
                Evidence: %s
                """.formatted(
                safe(category),
                authRequired,
                safe(evidence)); }
    private String fallbackInterpretation(String category, boolean authRequired) {
        if (authRequired) {
            return "The discovered resource appears to require authentication. "
                    + "The finding should still be reviewed to confirm that "
                    + "access controls are appropriate for the resource.";}
        String normalizedCategory = category == null ? "" : category.toUpperCase();
        return switch (normalizedCategory) {
            case "CONFIGURATION" ->
                    "A publicly discoverable configuration resource "
                            + "may expose implementation or deployment "
                            + "information that should not be externally "
                            + "accessible.";
            case "API_DOCUMENTATION" ->
                    "Public API documentation can reveal application "
                            + "interfaces, available operations, and "
                            + "implementation details. Review whether "
                            + "the documentation is intentionally public.";
            case "GRAPHQL" ->
                    "A publicly discoverable GraphQL surface may expose "
                            + "application functionality and should be "
                            + "reviewed to ensure appropriate access controls.";
            case "CLOUD_STORAGE" ->
                    "A publicly discoverable cloud-storage reference "
                            + "may expose information or resources beyond "
                            + "what was intended to be externally visible.";
            case "API_ENDPOINT" ->
                    "A publicly discoverable API endpoint should be "
                            + "reviewed to confirm that authentication, "
                            + "authorization, and exposure are intentional.";
            default ->
                    "The discovered resource represents an externally "
                            + "observable exposure signal that should be "
                            + "reviewed by the security team.";
        };
    }
    private String safe(String value) {
        if (value == null) {return "";}
        return value;
    }
}
