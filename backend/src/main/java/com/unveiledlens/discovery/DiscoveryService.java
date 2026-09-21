package com.unveiledlens.discovery;

import com.unveiledlens.ai.OllamaService;
import com.unveiledlens.compliance.DpdpMappingService;
import com.unveiledlens.discovery.dto.ExposureFinding;
import com.unveiledlens.discovery.dto.ExposureReport;
import com.unveiledlens.discovery.dto.ScanSummary;
import com.unveiledlens.discovery.dto.SerpApiResult;
import com.unveiledlens.remediation.RemediationTemplateService;
import com.unveiledlens.scanner.SafeHttpScanner;
import com.unveiledlens.spec.ApiSpecResult;
import com.unveiledlens.spec.ApiSpecService;

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

    private final SearchOrchestrator searchOrchestrator;

    private final DomainRelevanceFilter relevanceFilter;

    private final AssetRelevanceFilter assetRelevanceFilter;

    private final ExposureClassifier classifier;

    private final SafeHttpScanner safeHttpScanner;

    private final EvidenceEngine evidenceEngine;

    private final OllamaService ollamaService;

    private final ApiSpecService apiSpecService;

    private final AttackChainService attackChainService;

    private final DpdpMappingService dpdpMappingService;

    private final RemediationTemplateService remediationTemplateService;


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

        if (normalizedDomain.isBlank()) {

            throw new IllegalArgumentException(
                    "Invalid domain"
            );
        }

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
                adminMode
                        ? "ADMIN"
                        : "USER"
        );

        log.info(
                "Target domain: {}",
                normalizedDomain
        );


        /*
         * -----------------------------------------------------
         * DISCOVERY
         * -----------------------------------------------------
         */

        for (String query : queries) {

            List<SerpApiResult> results =
                    searchOrchestrator.search(
                            query
                    );

            if (results == null) {

                results = List.of();
            }

            rawResults +=
                    results.size();

            log.info(
                    "Query: {} | Results: {}",
                    query,
                    results.size()
            );


            for (
                    SerpApiResult result :
                    results
            ) {

                if (result == null) {
                    continue;
                }

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


        /*
         * -----------------------------------------------------
         * FINDING STATE
         * -----------------------------------------------------
         */

        List<ExposureFinding> findings =
                new ArrayList<>();

        int domainRelevant = 0;

        int filteredOut = 0;

        int reachableFindings = 0;

        int apiSurfaces = 0;

        int cloudStorageReferences = 0;

        int configurationSignals = 0;

        int graphqlSurfaces = 0;


        /*
         * -----------------------------------------------------
         * CLASSIFICATION + VALIDATION
         * -----------------------------------------------------
         */

        for (
                SerpApiResult result :
                uniqueResults.values()
        ) {

            String url =
                    normalizeUrl(
                            result.getUrl()
                    );

            if (url == null) {
                continue;
            }


            /*
             * DOMAIN RELEVANCE
             */

            boolean domainMatch =
                    relevanceFilter.isRelevant(
                            url,
                            normalizedDomain
                    );

            if (!domainMatch) {

                filteredOut++;

                continue;
            }

            domainRelevant++;


            /*
             * USER MODE ASSET FILTER
             *
             * Admin mode intentionally gets the
             * broader discovery result set.
             */

            if (!adminMode) {

                boolean relevant =
                        assetRelevanceFilter.isRelevant(
                                url,
                                safe(result.getTitle()),
                                safe(result.getSnippet())
                        );

                if (!relevant) {

                    filteredOut++;

                    continue;
                }
            }


            /*
             * CLASSIFICATION
             */

            String category =
                    classifier.classify(
                            url,
                            safe(result.getTitle()),
                            safe(result.getSnippet())
                    );

            if (
                    category == null
                    || "NONE".equals(category)
            ) {

                filteredOut++;

                continue;
            }


            /*
             * -------------------------------------------------
             * SAFE HTTP VALIDATION
             * -------------------------------------------------
             */

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

            boolean authRequired =
                    Boolean.TRUE.equals(
                            validation.get(
                                    "authRequired"
                            )
                    );

            boolean loginRedirect =
                    Boolean.TRUE.equals(
                            validation.get(
                                    "loginRedirect"
                            )
                    );

            boolean corsWildcard =
                    Boolean.TRUE.equals(
                            validation.get(
                                    "corsWildcard"
                            )
                    );


            Integer status =
                    validation.get(
                            "status"
                    ) instanceof Integer
                            ? (Integer)
                                    validation.get(
                                            "status"
                                    )
                            : null;


            String contentType =
                    validation.get(
                            "contentType"
                    ) instanceof String
                            ? (String)
                                    validation.get(
                                            "contentType"
                                    )
                            : null;


            /*
             * -------------------------------------------------
             * DETERMINISTIC EVIDENCE
             * -------------------------------------------------
             */

            List<String> evidence =
                    evidenceEngine.buildEvidence(
                            category,
                            url,
                            safe(result.getTitle()),
                            safe(result.getSnippet()),
                            validation
                    );


            /*
             * -------------------------------------------------
             * API SPEC
             * -------------------------------------------------
             */

            ApiSpecResult apiSpec =
                    createEmptyApiSpec();


            if (
                    isApiSpecCandidate(
                            category,
                            url,
                            result.getTitle(),
                            result.getSnippet()
                    )
            ) {

                try {

                    ApiSpecResult analyzedSpec =
                            apiSpecService.analyze(
                                    url
                            );

                    if (analyzedSpec != null) {

                        apiSpec =
                                analyzedSpec;
                    }

                } catch (Exception e) {

                    log.debug(
                            "API specification analysis failed for {}: {}",
                            url,
                            e.getMessage()
                    );
                }
            }


            /*
             * -------------------------------------------------
             * API SPEC EVIDENCE
             * -------------------------------------------------
             */

            List<String> combinedEvidence =
                    new ArrayList<>(
                            evidence
                    );


            if (apiSpec.isDetected()) {

                combinedEvidence.add(
                        "API specification detected: "
                                + safe(
                                        apiSpec.getFormat()
                                )
                );

                combinedEvidence.add(
                        "API endpoints described: "
                                + apiSpec
                                    .getEndpointCount()
                );

                combinedEvidence.add(
                        "Endpoints without defined security: "
                                + apiSpec
                                    .getUnsecuredEndpointCount()
                );


                if (
                        apiSpec
                                .isDeleteWithoutSecurity()
                ) {

                    combinedEvidence.add(
                            "DELETE endpoint without defined security"
                    );
                }


                if (
                        apiSpec
                                .isAdminLikeWithoutSecurity()
                ) {

                    combinedEvidence.add(
                            "Admin-like endpoint without defined security"
                    );
                }
            }


            /*
             * -------------------------------------------------
             * LOCAL ATTACK-CHAIN SIGNALS
             * -------------------------------------------------
             */

            List<String> attackSignals =
                    new ArrayList<>();


            if (
                    apiSpec.isDetected()
                    && apiSpec
                        .isAdminLikeWithoutSecurity()
            ) {

                attackSignals.add(
                        "UNPROTECTED_ADMIN_LIKE_API"
                );
            }


            if (
                    apiSpec.isDetected()
                    && apiSpec
                        .isDeleteWithoutSecurity()
            ) {

                attackSignals.add(
                        "DELETE_ENDPOINT_WITHOUT_DEFINED_SECURITY"
                );
            }


            /*
             * -------------------------------------------------
             * DPDP RELEVANCE
             * -------------------------------------------------
             */

            List<String> compliance =
                    dpdpMappingService.map(
                            category,
                            corsWildcard,
                            "CONFIGURATION".equals(
                                    category
                            )
                    );


            /*
             * -------------------------------------------------
             * REMEDIATION
             * -------------------------------------------------
             */

            String remediation =
                    remediationTemplateService
                            .getRemediation(
                                    category,
                                    corsWildcard,
                                    authRequired
                            );


            /*
             * -------------------------------------------------
             * RISK
             * -------------------------------------------------
             */

            String riskLevel =
                    determineRiskLevel(
                            category,
                            reachable,
                            authRequired,
                            corsWildcard,
                            apiSpec
                    );


            /*
             * -------------------------------------------------
             * OLLAMA INTERPRETATION
             *
             * IMPORTANT:
             *
             * Ollama does NOT decide the security result.
             *
             * Deterministic code above determines the signals.
             * Ollama only explains them.
             * -------------------------------------------------
             */

            String reason =
                    ollamaService.generateInterpretation(
                            category,
                            String.join(
                                    "; ",
                                    combinedEvidence
                            ),
                            authRequired
                    );


            /*
             * -------------------------------------------------
             * FINAL FINDING
             * -------------------------------------------------
             */

            ExposureFinding finding =
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
                            .authRequired(authRequired)
                            .loginRedirect(loginRedirect)
                            .corsWildcard(corsWildcard)
                            .status(status)
                            .contentType(contentType)
                            .riskLevel(riskLevel)
                            .evidence(combinedEvidence)
                            .compliance(compliance)
                            .attackChainSignals(
                                    attackSignals
                            )
                            .remediation(remediation)
                            .build();


            findings.add(
                    finding
            );


            /*
             * -------------------------------------------------
             * SUMMARY COUNTERS
             * -------------------------------------------------
             */

            if (reachable) {

                reachableFindings++;
            }


            if (
                    category.startsWith(
                            "API_"
                    )
            ) {

                apiSurfaces++;
            }


            if (
                    "GRAPHQL".equals(
                            category
                    )
            ) {

                graphqlSurfaces++;
            }


            if (
                    "CLOUD_STORAGE".equals(
                            category
                    )
            ) {

                cloudStorageReferences++;
            }


            if (
                    "CONFIGURATION".equals(
                            category
                    )
            ) {

                configurationSignals++;
            }
        }


        /*
         * -----------------------------------------------------
         * GLOBAL ATTACK-CHAIN CORRELATION
         * -----------------------------------------------------
         */

        List<String> globalAttackChains =
                attackChainService.correlate(
                        findings
                );


        if (
                globalAttackChains != null
                && !globalAttackChains.isEmpty()
        ) {

            for (
                    ExposureFinding finding :
                    findings
            ) {

                List<String> existing =
                        finding.getAttackChainSignals();

                List<String> combined =
                        new ArrayList<>();


                if (existing != null) {

                    combined.addAll(
                            existing
                    );
                }

                combined.addAll(
                        globalAttackChains
                );


                finding.setAttackChainSignals(
                        combined
                                .stream()
                                .distinct()
                                .toList()
                );
            }
        }


        /*
         * -----------------------------------------------------
         * LOGGING
         * -----------------------------------------------------
         */

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
                adminMode
                        ? "ADMIN"
                        : "USER"
        );


        /*
         * -----------------------------------------------------
         * SUMMARY
         * -----------------------------------------------------
         */

        int relevantAssets =
                adminMode
                        ? findings.size()
                        : Math.max(
                                0,
                                domainRelevant
                                        - filteredOut
                        );


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
                .domain(
                        normalizedDomain
                )
                .scannedAt(
                        Instant.now().toString()
                )
                .summary(
                        summary
                )
                .findings(
                        findings
                )
                .build();
    }


    private ApiSpecResult createEmptyApiSpec() {

        return ApiSpecResult.builder()
                .detected(false)
                .format(null)
                .endpointCount(0)
                .unsecuredEndpointCount(0)
                .unsecuredMethods(
                        List.of()
                )
                .unsecuredPaths(
                        List.of()
                )
                .deleteWithoutSecurity(false)
                .adminLikeWithoutSecurity(false)
                .build();
    }


    private boolean isApiSpecCandidate(
            String category,
            String url,
            String title,
            String snippet
    ) {

        String value =
                (
                        safe(category)
                                + " "
                                + safe(url)
                                + " "
                                + safe(title)
                                + " "
                                + safe(snippet)
                ).toLowerCase(
                        Locale.ROOT
                );


        return value.contains(
                    "swagger"
                )
                || value.contains(
                    "openapi"
                )
                || value.contains(
                    "api documentation"
                )
                || value.contains(
                    "swagger-ui"
                )
                || value.contains(
                    "openapi.json"
                )
                || value.contains(
                    "openapi.yaml"
                )
                || value.contains(
                    "openapi.yml"
                )
                || value.contains(
                    "swagger.json"
                )
                || value.contains(
                    "swagger.yaml"
                )
                || value.contains(
                    "swagger.yml"
                );
    }


    private String determineRiskLevel(
            String category,
            boolean reachable,
            boolean authRequired,
            boolean corsWildcard,
            ApiSpecResult apiSpec
    ) {

        if (
                "CONFIGURATION".equals(
                        category
                )
                && reachable
        ) {

            return "HIGH";
        }


        if (
                apiSpec
                        .isAdminLikeWithoutSecurity()
        ) {

            return "HIGH";
        }


        if (
                corsWildcard
                && !authRequired
        ) {

            return "HIGH";
        }


        if (
                "CLOUD_STORAGE".equals(
                        category
                )
        ) {

            return "MEDIUM";
        }


        if (
                "API_DOCUMENTATION".equals(
                        category
                )
        ) {

            return "MEDIUM";
        }


        return "LOW";
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
                            + " (\".env\" OR \"config\" OR \"configuration\")",

                    "site:" + domain
                            + " inurl:.env",

                    "site:" + domain
                            + " inurl:wp-config.php.bak",

                    "site:" + domain
                            + " intitle:\"index of\" \"backup\"",

                    "site:" + domain
                            + " inurl:actuator/env",

                    "site:" + domain
                            + " inurl:.git/config",

                    "site:" + domain
                            + " (\"access-control-allow-origin\" OR \"www-authenticate\")"
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


    private String normalizeDomain(
            String domain
    ) {

        if (domain == null) {

            return "";
        }


        String normalized =
                domain
                        .trim()
                        .toLowerCase(
                                Locale.ROOT
                        );


        normalized =
                normalized.replaceFirst(
                        "^https?://",
                        ""
                );


        normalized =
                normalized.split(
                        "/"
                )[0];


        normalized =
                normalized.split(
                        ":"
                )[0];


        if (
                normalized.startsWith(
                        "www."
                )
        ) {

            normalized =
                    normalized.substring(
                            4
                    );
        }


        return normalized;
    }


    private String normalizeUrl(
            String url
    ) {

        if (
                url == null
                || url.isBlank()
        ) {

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


            if (
                    scheme == null
                    || host == null
            ) {

                return null;
            }


            if (
                    !scheme.equalsIgnoreCase(
                            "http"
                    )
                    && !scheme.equalsIgnoreCase(
                            "https"
                    )
            ) {

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