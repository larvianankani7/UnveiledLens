
package com.unveiledlens.discovery;

import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class ExposureClassifier {

    public String classify(
            String url,
            String title,
            String snippet
    ) {

        String value =
                (
                        safe(url)
                                + " "
                                + safe(title)
                                + " "
                                + safe(snippet)
                ).toLowerCase(Locale.ROOT);

        String path =
                extractPath(url);

        if (containsAny(
                path,
                "/swagger",
                "/swagger-ui",
                "/openapi",
                "/api-docs",
                "/v3/api-docs"
        )) {

            return "API_DOCUMENTATION";
        }

        if (containsAny(
                path,
                "/graphql"
        )) {

            return "GRAPHQL";
        }

        if (containsAny(
                path,
                "/api/",
                "/v1/",
                "/v2/"
        )) {

            return "API_ENDPOINT";
        }

        if (containsAny(
                value,
                "s3.amazonaws.com",
                "storage.googleapis.com",
                "blob.core.windows.net",
                "amazonaws.com"
        )) {

            return "CLOUD_STORAGE";
        }

        if (containsAny(
                path,
                ".env",
                ".yaml",
                ".yml",
                ".json"
        )) {

            return "CONFIGURATION";
        }

        return "GENERAL_EXPOSURE";
    }

    public String getSeverity(String category) {

        return switch (category) {

            case "CONFIGURATION" ->
                    "HIGH";

            case "API_DOCUMENTATION",
                 "CLOUD_STORAGE" ->
                    "MEDIUM";

            case "GRAPHQL",
                 "API_ENDPOINT" ->
                    "LOW";

            default ->
                    "LOW";
        };
    }

    private String extractPath(String url) {

        if (url == null) {
            return "";
        }

        try {

            java.net.URI uri =
                    new java.net.URI(url);

            return safe(uri.getPath());

        } catch (Exception e) {

            return "";
        }
    }

    private boolean containsAny(
            String value,
            String... patterns
    ) {

        for (String pattern : patterns) {

            if (value.contains(pattern)) {
                return true;
            }
        }

        return false;
    }

    private String safe(String value) {

        return value == null
                ? ""
                : value;
    }
}

