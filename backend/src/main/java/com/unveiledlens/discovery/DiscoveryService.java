
package com.unveiledlens.discovery;

import com.unveiledlens.ai.OllamaService;
import com.unveiledlens.discovery.dto.ExposureFinding;
import com.unveiledlens.discovery.dto.ExposureReport;
import com.unveiledlens.discovery.dto.ScanSummary;
import com.unveiledlens.discovery.dto.SerpApiResult;
import com.unveiledlens.scanner.SafeHttpScanner;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DiscoveryService {

    private final SerpApiService serpApiService;
    private final DomainRelevanceFilter relevanceFilter;
    private final ExposureClassifier classifier;
    private final SafeHttpScanner safeHttpScanner;
    private final EvidenceEngine evidenceEngine;
    private final OllamaService ollamaService;

    public ExposureReport runDiscovery(
            String domain
    ) {

        String normalizedDomain =
                normalizeDomain(domain);

        List<String> queries =
                buildQueries(normalizedDomain);

        Map<String, SerpApiResult> uniqueResults =
                new LinkedHashMap<>();

        for (String query : queries) {

            List<SerpApiResult> results =
                    serpApiService.search(query);

            for (SerpApiResult result : results) {

                String normalizedUrl =
                        normalizeUrl(result.getUrl());

                if (normalizedUrl != null) {

                    uniqueResults.putIfAbsent(
                            normalizedUrl,
                            SerpApiResult.builder()
                                    .url(normalizedUrl)
                                    .title(result.getTitle())
                                    .snippet(result.getSnippet())
                                    .build()
                    );
                }
            }
        }

        List<ExposureFinding> findings =
                new ArrayList<>();

        int relevantAssets = 0;

        int reachableFindings = 0;
        int apiSurfaces = 0;
        int cloudStorageReferences = 0;
        int configurationSignals = 0;
        int graphqlSurfaces = 0;

        for (SerpApiResult result :
                uniqueResults.values()) {

            String url =
                    result.getUrl();

            if (!relevanceFilter.isRelevant(
                    url,
                    normalizedDomain
            )) {

                continue;
            }

            relevantAssets++;

            String category =
                    classifier.classify(
                            url,
                            result.getTitle(),
                            result.getSnippet()
                    );

            Map<String, Object> validation =
                    safeHttpScanner.safeValidate(url);

            boolean reachable =
                    Boolean.TRUE.equals(
                            validation.get("reachable")
                    );

            boolean redirected =
                    Boolean.TRUE.equals(
                            validation.get("redirected")
                    );

            Integer status =
                    (Integer)
                            validation.get("status");

            String contentType =
                    (String)
                            validation.get(
                                    "contentType"
                            );

            List<String> evidence =
                    evidenceEngine.buildEvidence(
                            category,
                            url,
                            result.getTitle(),
                            result.getSnippet(),
                            validation
                    );

            String evidenceText =
                    String.join(
                            "; ",
                            evidence
                    );

            String reason =
                    ollamaService.interpret(
                            category,
                            url,
                            reachable,
                            evidenceText
                    );

            findings.add(
                    ExposureFinding.builder()
                            .category(category)
                            .severity(
                                    classifier.getSeverity(
                                            category
                                    )
                            )
                            .url(url)
                            .reason(reason)
                            .discovered(true)
                            .targetOwned(true)
                            .reachable(reachable)
                            .redirected(redirected)
                            .status(status)
                            .contentType(contentType)
                            .evidence(evidence)
                            .build()
            );

            if (reachable) {
                reachableFindings++;
            }

            if (category.startsWith("API_")) {
                apiSurfaces++;
            }

            if (category.equals(
                    "GRAPHQL"
            )) {
                graphqlSurfaces++;
            }

            if (category.equals(
                    "CLOUD_STORAGE"
            )) {
                cloudStorageReferences++;
            }

            if (category.equals(
                    "CONFIGURATION"
            )) {
                configurationSignals++;
            }
        }

        ScanSummary summary =
                ScanSummary.builder()
                        .totalDiscovered(
                                uniqueResults.size()
                        )
                        .relevantAssets(
                                relevantAssets
                        )
                        .totalFindings(
                                findings.size()
                        )
                        .reachableFindings(
                                reachableFindings
                        )
                        .apiSurfaces(
                                apiSurfaces
                        )
                        .cloudStorageReferences(
                                cloudStorageReferences
                        )
                        .configurationSignals(
                                configurationSignals
                        )
                        .graphqlSurfaces(
                                graphqlSurfaces
                        )
                        .build();

        return ExposureReport.builder()
                .domain(normalizedDomain)
                .scannedAt(
                        Instant.now().toString()
                )
                .summary(summary)
                .findings(findings)
                .build();
    }

    private List<String> buildQueries(
            String domain
    ) {

        return List.of(
                "site:" + domain,

                "site:" + domain
                        + " (swagger OR \"swagger-ui\" OR openapi OR \"api docs\")",

                "site:" + domain
                        + " (\"/api/\" OR \"/v1/\" OR \"/v2/\")",

                "site:" + domain
                        + " (graphql OR \"/graphql\")",

                "site:" + domain
                        + " (filetype:json OR filetype:yaml OR filetype:yml)",

                "site:" + domain
                        + " (\"s3.amazonaws.com\" OR \"amazonaws.com\" OR \"storage.googleapis.com\" OR \"blob.core.windows.net\")"
        );
    }

    private String normalizeDomain(
            String domain
    ) {

        if (domain == null) {
            return "";
        }

        String normalized =
                domain.trim()
                        .toLowerCase(Locale.ROOT);

        normalized =
                normalized.replaceFirst(
                        "^https?://",
                        ""
                );

        normalized =
                normalized.split("/")[0];

        normalized =
                normalized.split(":")[0];

        if (normalized.startsWith("www.")) {

            normalized =
                    normalized.substring(4);
        }

        return normalized;
    }

    private String normalizeUrl(
            String url
    ) {

        if (url == null
                || url.isBlank()) {

            return null;
        }

        try {

            java.net.URI uri =
                    new java.net.URI(
                            url.trim()
                    );

            String scheme =
                    uri.getScheme();

            String host =
                    uri.getHost();

            if (scheme == null
                    || host == null) {

                return null;
            }

            if (!scheme.equalsIgnoreCase("http")
                    && !scheme.equalsIgnoreCase(
                    "https"
            )) {

                return null;
            }

            return uri.toString();

        } catch (Exception e) {

            return null;
        }
    }
}

