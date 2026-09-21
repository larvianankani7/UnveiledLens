package com.unveiledlens.discovery;

import com.unveiledlens.ai.OllamaService;
import com.unveiledlens.discovery.dto.ExposureFinding;
import com.unveiledlens.discovery.dto.ExposureReport;
import com.unveiledlens.discovery.dto.ScanSummary;
import com.unveiledlens.discovery.dto.SerpApiResult;
import com.unveiledlens.scanner.SafeHttpScanner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiscoveryService {

    private final SerpApiService serpApiService;
    private final DomainRelevanceFilter relevanceFilter;
    private final AssetRelevanceFilter assetRelevanceFilter;
    private final ExposureClassifier classifier;
    private final SafeHttpScanner safeHttpScanner;
    private final EvidenceEngine evidenceEngine;
    private final OllamaService ollamaService;
    int classifiedAssets = 0;
    public ExposureReport runDiscovery(
            String domain
    ) {

        return scan(
                domain,
                false
        );
    }

    public ExposureReport runAdminDiscovery(
            String domain
    ) {

        return scan(
                domain,
                true
        );
    }

    private ExposureReport scan(
            String domain,
            boolean adminMode
    ) {

        String normalizedDomain =
                normalizeDomain(domain);

        List<String> queries =
                buildQueries(
                        normalizedDomain,
                        adminMode
                );

        Map<String, SerpApiResult> uniqueResults =
                new LinkedHashMap<>();

        int rawResults = 0;

        log.info(
                "========== {} SCAN START ==========",
                adminMode ? "ADMIN" : "USER"
        );

        log.info(
                "Target domain: {}",
                normalizedDomain
        );

        for (String query : queries) {

            List<SerpApiResult> results =
                    serpApiService.search(query);

            rawResults += results.size();

            log.info(
                    "Query: {} | Results: {}",
                    query,
                    results.size()
            );

            for (SerpApiResult result : results) {

                String normalizedUrl =
                        normalizeUrl(
                                result.getUrl()
                        );

                if (normalizedUrl == null) {
                    continue;
                }

                uniqueResults.putIfAbsent(
                        normalizedUrl,
                        result
                );
            }
        }

        log.info(
                "Raw results: {}",
                rawResults
        );

        log.info(
                "Unique URLs: {}",
                uniqueResults.size()
        );

        List<ExposureFinding> findings =
                new ArrayList<>();

        int domainRelevant = 0;
        int filteredOut = 0;
        int reachableFindings = 0;
        int apiSurfaces = 0;
        int cloudStorageReferences = 0;
        int configurationSignals = 0;
        int graphqlSurfaces = 0;

        for (SerpApiResult result :
                uniqueResults.values()) {

            String url =
                    result.getUrl();

            boolean domainMatch =
                    relevanceFilter.isRelevant(
                            url,
                            normalizedDomain
                    );

            if (!domainMatch) {

                continue;
            }

            domainRelevant++;

            /*
             * USER MODE:
             * Keep the strict filter.
             *
             * ADMIN MODE:
             * Do NOT apply the asset filter.
             * Admin needs broader intelligence.
             */

            if (!adminMode) {

                boolean relevant =
                        assetRelevanceFilter.isRelevant(
                                url,
                                result.getTitle(),
                                result.getSnippet()
                        );

                if (!relevant) {

                    filteredOut++;

                    continue;
                }
            }

            String category =
                    classifier.classify(
                            url,
                            result.getTitle(),
                            result.getSnippet()
                    );
  
            if ("NONE".equals(category)) {
                filteredOut++;
                continue;
            }
        classifiedAssets++;
            Map<String, Object> validation =
                    safeHttpScanner.safeValidate(
                            url
                    );

            boolean reachable =
                    Boolean.TRUE.equals(
                            validation.get(
                                    "reachable"
                            )
                    );

            boolean redirected =
                    Boolean.TRUE.equals(
                            validation.get(
                                    "redirected"
                            )
                    );

            Integer status =
                    (Integer)
                            validation.get(
                                    "status"
                            );

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

            String reason =
                    ollamaService.interpret(
                            category,
                            url,
                            reachable,
                            String.join(
                                    "; ",
                                    evidence
                            )
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

            if (category.equals("GRAPHQL")) {
                graphqlSurfaces++;
            }

            if (category.equals("CLOUD_STORAGE")) {
                cloudStorageReferences++;
            }

            if (category.equals("CONFIGURATION")) {
                configurationSignals++;
            }
        }

        log.info(
                "Domain relevant: {}",
                domainRelevant
        );

        log.info(
                "Filtered out: {}",
                filteredOut
        );

        log.info(
                "Final findings: {}",
                findings.size()
        );

        log.info(
                "Reachable findings: {}",
                reachableFindings
        );

        log.info(
                "========== {} SCAN END ==========",
                adminMode ? "ADMIN" : "USER"
        );

        ScanSummary summary =
                ScanSummary.builder()
                        .totalDiscovered(
                                uniqueResults.size()
                        )
                        .relevantAssets(
                            adminMode
                                ? classifiedAssets
                                : domainRelevant - filteredOut
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
            String domain,
            boolean adminMode
    ) {

        if (adminMode) {

            return List.of(

                    "site:" + domain,

                    "site:" + domain
                            + " (swagger OR \"swagger-ui\" OR openapi OR \"api docs\" OR \"api documentation\")",

                    "site:" + domain
                            + " (api OR graphql OR developer OR developers)",

                    "site:" + domain
                            + " (\"/api/\" OR \"/v1/\" OR \"/v2/\" OR \"/v3/\" OR \"/graphql\")",

                    "site:" + domain
                            + " (filetype:json OR filetype:yaml OR filetype:yml OR filetype:xml)",

                    "site:" + domain
                            + " (\"s3.amazonaws.com\" OR \"amazonaws.com\" OR \"storage.googleapis.com\" OR \"blob.core.windows.net\")",

                    "site:" + domain
                            + " (\".env\" OR \"config\" OR \"configuration\")"
            );
        }

        return List.of(

                "site:" + domain
                        + " (swagger OR \"swagger-ui\" OR openapi OR \"api docs\")",

                "site:" + domain
                        + " (\"/api/\" OR \"/v1/\" OR \"/v2/\" OR \"/v3/\")",

                "site:" + domain
                        + " (graphql OR \"/graphql\")",

                "site:" + domain
                        + " (filetype:json OR filetype:yaml OR filetype:yml OR filetype:xml)",

                "site:" + domain
                        + " (\"s3.amazonaws.com\" OR \"amazonaws.com\" OR \"storage.googleapis.com\" OR \"blob.core.windows.net\")",

                "site:" + domain
                        + " (\".env\" OR \"config\" OR \"configuration\")"
        );
    }

    private boolean containsTechnicalSignal(
            String value
    ) {

        return value.contains("api")
                || value.contains("graphql")
                || value.contains("swagger")
                || value.contains("openapi")
                || value.contains("developer")
                || value.contains("documentation")
                || value.contains("configuration")
                || value.contains(".env")
                || value.contains("amazonaws")
                || value.contains("storage.googleapis")
                || value.contains("blob.core");
    }

    private String normalizeDomain(
            String domain
    ) {

        if (domain == null) {
            return "";
        }

        String normalized =
                domain.trim()
                        .toLowerCase(
                                Locale.ROOT
                        );

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

            URI uri =
                    new URI(
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
                    && !scheme.equalsIgnoreCase("https")) {

                return null;
            }

            return uri.toString();

        } catch (Exception e) {

            return null;
        }
    }

    private String safe(
            String value
    ) {

        return value == null
                ? ""
                : value;
    }
}