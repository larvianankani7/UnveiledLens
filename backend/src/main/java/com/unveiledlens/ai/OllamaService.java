
package com.unveiledlens.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class OllamaService {

    @Value("${ollama.url:http://localhost:11434}")
    private String ollamaUrl;

    @Value("${ollama.model:llama3}")
    private String model;

    private final RestTemplate restTemplate =
            new RestTemplate();

    private final ObjectMapper objectMapper =
            new ObjectMapper();

    public String interpret(
            String category,
            String url,
            boolean reachable,
            String evidence
    ) {

        String prompt =
                """
                You are the security analyst component of UnveiledLens.

                Explain the supplied deterministic security finding
                in one or two concise sentences.

                Do not invent vulnerabilities.
                Do not claim a vulnerability is confirmed unless the evidence explicitly supports it.
                Treat public discovery and HTTP reachability as signals, not proof of a security vulnerability.
                Do not recommend exploitation or bypass techniques.

                Category: %s
                URL: %s
                Reachable: %s
                Evidence: %s
                """.formatted(
                        category,
                        url,
                        reachable,
                        evidence
                );

        try {

            Map<String, Object> request =
                    new HashMap<>();

            request.put(
                    "model",
                    model
            );

            request.put(
                    "prompt",
                    prompt
            );

            request.put(
                    "stream",
                    false
            );

            String response =
                    restTemplate.postForObject(
                            ollamaUrl
                                    + "/api/generate",
                            request,
                            String.class
                    );

            if (response == null
                    || response.isBlank()) {

                return fallback(
                        category,
                        reachable
                );
            }

            JsonNode root =
                    objectMapper.readTree(response);

            String generated =
                    root.path("response")
                            .asText("")
                            .trim();

            if (generated.isBlank()) {

                return fallback(
                        category,
                        reachable
                );
            }

            return generated;

        } catch (Exception e) {

            log.debug(
                    "Ollama interpretation unavailable: {}",
                    e.getMessage()
            );

            return fallback(
                    category,
                    reachable
            );
        }
    }

    private String fallback(
            String category,
            boolean reachable
    ) {

        if (!reachable) {

            return "A target-owned resource was discovered, but safe HTTP validation did not confirm a successful direct response.";
        }

        return switch (category) {

            case "API_DOCUMENTATION" ->
                    "Target-owned API documentation appears publicly reachable and may reveal implementation details or available API operations.";

            case "GRAPHQL" ->
                    "A target-owned GraphQL surface appears publicly reachable and should be reviewed for intended public exposure.";

            case "API_ENDPOINT" ->
                    "A target-owned API endpoint was discovered and appears publicly reachable.";

            case "CLOUD_STORAGE" ->
                    "A cloud-storage reference associated with the target was discovered and should be reviewed for unintended public exposure.";

            case "CONFIGURATION" ->
                    "A configuration-like resource appears publicly reachable and should be reviewed for sensitive information.";

            default ->
                    "A target-owned publicly reachable resource was discovered and should be reviewed for intended exposure.";
        };
    }
}

