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
import org.springframework.beans.factory.annotation.Qualifier;
import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.atomic.AtomicInteger;

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
    private final ScanCacheService scanCacheService;
    @Qualifier("discoveryIoExecutor")
    private final Executor discoveryIoExecutor;
    public ExposureReport runDiscovery(String domain) {
        String normalizedDomain = normalizeDomain(domain);
        return scanCacheService.getOrStart(normalizedDomain, false, () -> scan(normalizedDomain, false));
    }
    public ExposureReport runAdminDiscovery(String domain) {
        String normalizedDomain = normalizeDomain(domain);
        return scanCacheService.getOrStart(normalizedDomain, true, () -> scan(normalizedDomain, true));
    }
    private ExposureReport scan(String domain, boolean adminMode) {
        String normalizedDomain = normalizeDomain(domain);
        if (normalizedDomain.isBlank()) {
            throw new IllegalArgumentException("Invalid domain");
        }
        List<String> queries = buildQueries(normalizedDomain, adminMode);
        Map<String, SerpApiResult> uniqueResults = new LinkedHashMap<>();
        int rawResults = 0;
        log.info("========== {} SCAN START ==========", adminMode ? "ADMIN" : "USER");
        log.info("Target domain: {}", normalizedDomain);
        List<CompletableFuture<List<SerpApiResult>>> queryFutures = queries.stream()
                .map(query -> CompletableFuture.supplyAsync(() -> searchOrchestrator.search(query), discoveryIoExecutor)
                        .exceptionally(error -> List.of()))
                .toList();
        for (int queryIndex = 0; queryIndex < queries.size(); queryIndex++) {
            String query = queries.get(queryIndex);
            List<SerpApiResult> results = queryFutures.get(queryIndex).join();
            if (results == null) {results = List.of();}
            rawResults += results.size();
            log.info("Query: {} | Results: {}", query, results.size());
            for (SerpApiResult result : results) {
                if (result == null) {continue;}
                String normalizedUrl = normalizeUrl(result.getUrl());
                if (normalizedUrl == null) {continue;}
                uniqueResults.putIfAbsent(normalizedUrl, result);
            }
        }
        log.info("Raw results: {}", rawResults);
        log.info("Unique URLs: {}", uniqueResults.size());
        Map<String, Integer> discoveryOrder = new LinkedHashMap<>();
        int resultIndex = 0;
        for (String url : uniqueResults.keySet()) discoveryOrder.put(url, resultIndex++);
        List<ExposureFinding> findings = Collections.synchronizedList(new ArrayList<>());
        AtomicInteger domainRelevant = new AtomicInteger();
        AtomicInteger filteredOut = new AtomicInteger();
        AtomicInteger reachableFindings = new AtomicInteger();
        AtomicInteger apiSurfaces = new AtomicInteger();
        AtomicInteger cloudStorageReferences = new AtomicInteger();
        AtomicInteger configurationSignals = new AtomicInteger();
        AtomicInteger graphqlSurfaces = new AtomicInteger();
        List<CompletableFuture<Void>> analysisFutures = new ArrayList<>();
        for (SerpApiResult result : uniqueResults.values()) {
            analysisFutures.add(CompletableFuture.runAsync(() -> {
                String url = normalizeUrl(result.getUrl());
                if (url == null) {return;}
                boolean domainMatch = relevanceFilter.isRelevant(url, normalizedDomain);
                if (!domainMatch) {
                    filteredOut.incrementAndGet();
                    return;
                }
                domainRelevant.incrementAndGet();
                if (!adminMode) {
                    boolean relevant = assetRelevanceFilter.isRelevant(url, safe(result.getTitle()), safe(result.getSnippet()));
                    if (!relevant) {
                        filteredOut.incrementAndGet();
                        return;
                    }
                }
                String category = classifier.classify(url, safe(result.getTitle()), safe(result.getSnippet()));
                if (category == null || "NONE".equals(category)) {
                    filteredOut.incrementAndGet();
                    return;
                }
                Map<String, Object> validation = safeHttpScanner.safeValidate(url);
                boolean reachable = Boolean.TRUE.equals(validation.get("reachable"));
                boolean redirected = Boolean.TRUE.equals(validation.get("redirected"));
                boolean authRequired = Boolean.TRUE.equals(validation.get("authRequired"));
                boolean loginRedirect = Boolean.TRUE.equals(validation.get("loginRedirect"));
                boolean corsWildcard = Boolean.TRUE.equals(validation.get("corsWildcard"));
                Integer status = validation.get("status") instanceof Integer ? (Integer) validation.get("status") : null;
                String contentType = validation.get("contentType") instanceof String ? (String) validation.get("contentType") : null;
                List<String> evidence = evidenceEngine.buildEvidence(category, url, safe(result.getTitle()), safe(result.getSnippet()), validation);
                ApiSpecResult apiSpec = createEmptyApiSpec();
                if (isApiSpecCandidate(category, url, result.getTitle(), result.getSnippet())) {
                    try {
                        ApiSpecResult analyzedSpec = apiSpecService.analyze(url);
                        if (analyzedSpec != null) {apiSpec = analyzedSpec;}
                    } catch (Exception e) {
                        log.debug("API specification analysis failed for {}: {}", url, e.getMessage());
                    }
                }
                List<String> combinedEvidence = new ArrayList<>(evidence);
                if (apiSpec.isDetected()) {
                    combinedEvidence.add("API specification detected: " + safe(apiSpec.getFormat()));
                    combinedEvidence.add("API endpoints described: " + apiSpec.getEndpointCount());
                    combinedEvidence.add("Endpoints without defined security: " + apiSpec.getUnsecuredEndpointCount());
                    if (apiSpec.isDeleteWithoutSecurity()) {
                        combinedEvidence.add("DELETE endpoint without defined security");
                    }
                    if (apiSpec.isAdminLikeWithoutSecurity()) {
                        combinedEvidence.add("Admin-like endpoint without defined security");
                    }
                }
                List<String> attackSignals = new ArrayList<>();
                if (apiSpec.isDetected() && apiSpec.isAdminLikeWithoutSecurity()) {
                    attackSignals.add("UNPROTECTED_ADMIN_LIKE_API");
                }
                if (apiSpec.isDetected() && apiSpec.isDeleteWithoutSecurity()) {
                    attackSignals.add("DELETE_ENDPOINT_WITHOUT_DEFINED_SECURITY");
                }
                List<String> compliance = dpdpMappingService.map(category, corsWildcard, "CONFIGURATION".equals(category));
                String remediation = remediationTemplateService.getRemediation(category, corsWildcard, authRequired);
                String riskLevel = determineRiskLevel(category, reachable, authRequired, corsWildcard, apiSpec);
                String reason = ollamaService.generateInterpretation(category, String.join("; ", combinedEvidence), authRequired);
                ExposureFinding finding = ExposureFinding.builder()
                        .category(category)
                        .severity(classifier.getSeverity(category))
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
                        .attackChainSignals(attackSignals)
                        .remediation(remediation)
                        .build();
                findings.add(finding);
                if (reachable) {reachableFindings.incrementAndGet();}
                if (category.startsWith("API_")) {apiSurfaces.incrementAndGet();}
                if ("GRAPHQL".equals(category)) {graphqlSurfaces.incrementAndGet();}
                if ("CLOUD_STORAGE".equals(category)) {cloudStorageReferences.incrementAndGet();}
                if ("CONFIGURATION".equals(category)) {configurationSignals.incrementAndGet();}
            }, discoveryIoExecutor));
        }
        CompletableFuture.allOf(analysisFutures.toArray(CompletableFuture[]::new)).join();
        findings.sort(java.util.Comparator.comparingInt(finding -> discoveryOrder.getOrDefault(finding.getUrl(), Integer.MAX_VALUE)));
        List<String> globalAttackChains = attackChainService.correlate(findings);
        if (globalAttackChains != null && !globalAttackChains.isEmpty()) {
            for (ExposureFinding finding : findings) {
                List<String> existing = finding.getAttackChainSignals();
                List<String> combined = new ArrayList<>();
                if (existing != null) {combined.addAll(existing);}
                combined.addAll(globalAttackChains);
                finding.setAttackChainSignals(combined.stream().distinct().toList());
            }
        }
        log.info("Domain relevant: {}", domainRelevant.get());
        log.info("Filtered out: {}", filteredOut.get());
        log.info("Final findings: {}", findings.size());
        log.info("Reachable findings: {}", reachableFindings.get());
        log.info("========== {} SCAN END ==========", adminMode ? "ADMIN" : "USER");
        int relevantAssets = adminMode ? findings.size() : Math.max(0, domainRelevant.get() - filteredOut.get());
        ScanSummary summary = ScanSummary.builder()
                .totalDiscovered(uniqueResults.size())
                .relevantAssets(relevantAssets)
                .totalFindings(findings.size())
                .reachableFindings(reachableFindings.get())
                .apiSurfaces(apiSurfaces.get())
                .cloudStorageReferences(cloudStorageReferences.get())
                .configurationSignals(configurationSignals.get())
                .graphqlSurfaces(graphqlSurfaces.get())
                .build();
        return ExposureReport.builder()
                .domain(normalizedDomain)
                .scannedAt(Instant.now().toString())
                .summary(summary)
                .findings(findings)
                .build();
    }
    private ApiSpecResult createEmptyApiSpec() {
        return ApiSpecResult.builder()
                .detected(false)
                .format(null)
                .endpointCount(0)
                .unsecuredEndpointCount(0)
                .unsecuredMethods(List.of())
                .unsecuredPaths(List.of())
                .deleteWithoutSecurity(false)
                .adminLikeWithoutSecurity(false)
                .build();
    }
    private boolean isApiSpecCandidate(
            String category,
            String url,
            String title,
            String snippet) {
        String value = (
                safe(category)
                        + " "
                        + safe(url)
                        + " "
                        + safe(title)
                        + " "
                        + safe(snippet)
        ).toLowerCase(Locale.ROOT);
        return value.contains("swagger")
                || value.contains("openapi")
                || value.contains("api documentation")
                || value.contains("swagger-ui")
                || value.contains("openapi.json")
                || value.contains("openapi.yaml")
                || value.contains("openapi.yml")
                || value.contains("swagger.json")
                || value.contains("swagger.yaml")
                || value.contains("swagger.yml");
    }
    private String determineRiskLevel(
            String category,
            boolean reachable,
            boolean authRequired,
            boolean corsWildcard,
            ApiSpecResult apiSpec) {
        if ("CONFIGURATION".equals(category) && reachable) {
            return "HIGH";
        }
        if (apiSpec.isAdminLikeWithoutSecurity()) {
            return "HIGH";
        }
        if (corsWildcard && !authRequired) {
            return "HIGH";
        }
        if ("CLOUD_STORAGE".equals(category)) {
            return "MEDIUM";
        }
        if ("API_DOCUMENTATION".equals(category)) {
            return "MEDIUM";
        }
        return "LOW";
    }
    private List<String> buildQueries(
            String domain,
            boolean adminMode) {
        if (adminMode) {
            return List.of(
                    "site:" + domain,
                    "site:" + domain + " (swagger OR \"swagger-ui\" OR openapi OR \"api docs\" OR \"api documentation\")",
                    "site:" + domain + " (api OR graphql OR developer OR developers)",
                    "site:" + domain + " (\"/api/\" OR \"/v1/\" OR \"/v2/\" OR \"/v3/\" OR \"/graphql\")",
                    "site:" + domain + " (filetype:json OR filetype:yaml OR filetype:yml OR filetype:xml)",
                    "site:" + domain + " (\"s3.amazonaws.com\" OR \"amazonaws.com\" OR \"storage.googleapis.com\" OR \"blob.core.windows.net\")",
                    "site:" + domain + " (\".env\" OR \"config\" OR \"configuration\")",
                    "site:" + domain + " inurl:.env",
                    "site:" + domain + " inurl:wp-config.php.bak",
                    "site:" + domain + " intitle:\"index of\" \"backup\"",
                    "site:" + domain + " inurl:actuator/env",
                    "site:" + domain + " inurl:.git/config",
                    "site:" + domain + " (\"access-control-allow-origin\" OR \"www-authenticate\")"
            );
        }
        return List.of(
                "site:" + domain + " (swagger OR \"swagger-ui\" OR openapi OR \"api docs\")",
                "site:" + domain + " (\"/api/\" OR \"/v1/\" OR \"/v2/\" OR \"/v3/\")",
                "site:" + domain + " (graphql OR \"/graphql\")",
                "site:" + domain + " (filetype:json OR filetype:yaml OR filetype:yml OR filetype:xml)",
                "site:" + domain + " (\"s3.amazonaws.com\" OR \"amazonaws.com\" OR \"storage.googleapis.com\" OR \"blob.core.windows.net\")",
                "site:" + domain + " (\".env\" OR \"config\" OR \"configuration\")"
        );
    }
    private String normalizeDomain(
            String domain) {
        if (domain == null) {
            return "";
        }
        String normalized = domain.trim().toLowerCase(Locale.ROOT);
        normalized = normalized.replaceFirst("^https?://", "");
        normalized = normalized.split("/")[0];
        normalized = normalized.split(":")[0];
        if (normalized.startsWith("www.")) {
            normalized = normalized.substring(4);
        }
        return normalized;
    }
    private String normalizeUrl(
            String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        try {
            URI uri = new URI(url.trim());
            String scheme = uri.getScheme();
            String host = uri.getHost();
            if (scheme == null || host == null) {
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
            String value) {
        return value == null
                ? ""
                : value;
    }
}