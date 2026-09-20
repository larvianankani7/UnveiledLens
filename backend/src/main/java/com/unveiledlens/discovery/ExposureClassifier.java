package com.unveiledlens.discovery;

import org.springframework.stereotype.Service;

@Service
public class ExposureClassifier {

    public String classify(String url) {
        String lowerUrl = url.toLowerCase();
        
        if (lowerUrl.contains("swagger") || lowerUrl.contains("openapi") || lowerUrl.contains("api-docs")) {
            return "API_DOCUMENTATION";
        }
        if (lowerUrl.contains("graphql")) {
            return "GRAPHQL";
        }
        if (lowerUrl.contains("/api/") || lowerUrl.contains("/v1/") || lowerUrl.contains("/v2/")) {
            return "API_ENDPOINT";
        }
        if (lowerUrl.contains("s3.amazonaws.com") || lowerUrl.contains("amazonaws.com") || lowerUrl.contains("storage.googleapis.com")) {
            return "CLOUD_STORAGE";
        }
        if (lowerUrl.endsWith(".json") || lowerUrl.endsWith(".yaml") || lowerUrl.endsWith(".yml") || lowerUrl.endsWith(".env")) {
            return "CONFIGURATION";
        }
        return "GENERAL_EXPOSURE";
    }

    public String getSeverity(String category) {
        switch (category) {
            case "CONFIGURATION":
                return "HIGH";
            case "API_DOCUMENTATION":
            case "CLOUD_STORAGE":
                return "MEDIUM";
            default:
                return "LOW";
        }
    }
}
