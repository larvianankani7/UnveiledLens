
package com.unveiledlens.discovery;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class EvidenceEngine {

    public List<String> buildEvidence(
            String category,
            String url,
            String title,
            String snippet,
            Map<String, Object> validation
    ) {

        List<String> evidence =
                new ArrayList<>();

        evidence.add(
                "Target-owned URL passed domain relevance filtering."
        );

        Integer status =
                (Integer)
                        validation.get("status");

        Boolean reachable =
                (Boolean)
                        validation.getOrDefault(
                                "reachable",
                                false
                        );

        Boolean redirected =
                (Boolean)
                        validation.getOrDefault(
                                "redirected",
                                false
                        );

        String contentType =
                (String)
                        validation.get(
                                "contentType"
                        );

        if (status != null) {

            evidence.add(
                    "HTTP status: " + status
            );
        }

        if (Boolean.TRUE.equals(reachable)) {

            evidence.add(
                    "Resource responded successfully to safe HTTP validation."
            );
        }

        if (Boolean.TRUE.equals(redirected)) {

            evidence.add(
                    "Resource returned a redirect instead of a direct successful response."
            );
        }

        if (contentType != null
                && !contentType.isBlank()) {

            evidence.add(
                    "Content type: " + contentType
            );
        }

        String searchable =
                (
                        safe(title)
                                + " "
                                + safe(snippet)
                                + " "
                                + safe(url)
                ).toLowerCase();

        switch (category) {

            case "API_DOCUMENTATION" -> {

                if (searchable.contains("swagger")) {

                    evidence.add(
                            "Swagger-related discovery signal detected."
                    );
                }

                if (searchable.contains("openapi")) {

                    evidence.add(
                            "OpenAPI-related discovery signal detected."
                    );
                }
            }

            case "GRAPHQL" -> evidence.add(
                    "GraphQL endpoint path detected."
            );

            case "API_ENDPOINT" -> evidence.add(
                    "API endpoint path pattern detected."
            );

            case "CONFIGURATION" -> evidence.add(
                    "Configuration-like file path detected."
            );

            case "CLOUD_STORAGE" -> evidence.add(
                    "Cloud storage reference detected in search result context."
            );

            default -> {
            }
        }

        return evidence;
    }

    private String safe(String value) {

        return value == null
                ? ""
                : value;
    }
}

