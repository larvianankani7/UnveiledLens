package com.unveiledlens.discovery;

import com.unveiledlens.ai.OllamaService;
import com.unveiledlens.discovery.dto.ExposureFinding;
import com.unveiledlens.discovery.dto.ExposureReport;
import com.unveiledlens.discovery.dto.ScanSummary;
import com.unveiledlens.scanner.SafeHttpScanner;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DiscoveryService {
    private final SerpApiService serpApiService;
    private final ExposureClassifier classifier;
    private final SafeHttpScanner safeHttpScanner;
    private final OllamaService ollamaService;

    public ExposureReport runDiscovery(String domain) {
        Set<String> uniqueUrls = new HashSet<>();
        
        List<String> queries = List.of(
            "site:" + domain,
            "site:" + domain + " (swagger OR \"swagger-ui\" OR openapi OR \"api docs\")",
            "site:" + domain + " (\"/api/\" OR \"/v1/\" OR \"/v2/\")",
            "site:" + domain + " (graphql OR \"/graphql\")",
            "site:" + domain + " (filetype:json OR filetype:yaml OR filetype:yml)",
            "site:" + domain + " (\"s3.amazonaws.com\" OR \"amazonaws.com\")"
        );

        for (String query : queries) {
            List<String> results = serpApiService.search(query);
            uniqueUrls.addAll(results);
        }

        List<ExposureFinding> findings = new ArrayList<>();
        int apiSurfaces = 0;
        int cloudStorageReferences = 0;
        int configurationSignals = 0;

        for (String url : uniqueUrls) {
            String category = classifier.classify(url);
            String severity = classifier.getSeverity(category);
            
            Map<String, Object> validation = safeHttpScanner.safeValidate(url);
            boolean reachable = (boolean) validation.getOrDefault("reachable", false);
            Integer status = (Integer) validation.get("status");
            String contentType = (String) validation.get("contentType");

            String reason = "Potential exposure discovered.";
            try {
                reason = ollamaService.interpret("Category: " + category + " URL: " + url + " Reachable: " + reachable);
            } catch (Exception e) {
                // Fallback if Ollama fails
                if (category.equals("API_DOCUMENTATION")) reason = "Public API documentation exposure.";
                else if (category.equals("GRAPHQL")) reason = "Potential publicly discoverable GraphQL surface.";
                else if (category.equals("API_ENDPOINT")) reason = "API surface discovered.";
                else if (category.equals("CLOUD_STORAGE")) reason = "Cloud/storage reference discovered.";
                else if (category.equals("CONFIGURATION")) reason = "Potential configuration exposure.";
            }

            findings.add(ExposureFinding.builder()
                .category(category)
                .severity(severity)
                .url(url)
                .reason(reason)
                .discovered(true)
                .reachable(reachable)
                .status(status)
                .contentType(contentType)
                .build());

            if (category.startsWith("API_")) apiSurfaces++;
            if (category.equals("CLOUD_STORAGE")) cloudStorageReferences++;
            if (category.equals("CONFIGURATION")) configurationSignals++;
        }

        ScanSummary summary = ScanSummary.builder()
            .totalFindings(findings.size())
            .apiSurfaces(apiSurfaces)
            .cloudStorageReferences(cloudStorageReferences)
            .configurationSignals(configurationSignals)
            .build();

        return ExposureReport.builder()
            .domain(domain)
            .scannedAt(Instant.now().toString())
            .summary(summary)
            .findings(findings)
            .build();
    }
}
