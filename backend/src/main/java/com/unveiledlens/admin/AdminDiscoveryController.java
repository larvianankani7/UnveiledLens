package com.unveiledlens.admin;

import com.unveiledlens.admin.dto.AdminExposureFinding;
import com.unveiledlens.admin.dto.AdminExposureReport;
import com.unveiledlens.admin.dto.AdminScanSummary;
import com.unveiledlens.discovery.DiscoveryService;
import com.unveiledlens.discovery.dto.ExposureFinding;
import com.unveiledlens.discovery.dto.ExposureReport;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/discovery")
@RequiredArgsConstructor
public class AdminDiscoveryController {

    private final DiscoveryService discoveryService;
    private final AdminRedactionService redactionService;

    @PostMapping("/scan")
    public ResponseEntity<?> scan(
            @Valid @RequestBody AdminScanRequest request
    ) {

        String domain =
                normalizeDomain(
                        request.getDomain()
                );

        if (!isValidDomain(domain)) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    "Enter a valid target domain."
                            )
                    );
        }

        ExposureReport report =
                discoveryService.runAdminDiscovery(
                        domain
                );

        AdminExposureReport adminReport =
                toAdminReport(report);

        return ResponseEntity.ok(
                adminReport
        );
    }

    private AdminExposureReport toAdminReport(
            ExposureReport report
    ) {

        List<AdminExposureFinding> findings =
                report.getFindings()
                        .stream()
                        .map(this::toAdminFinding)
                        .toList();

        int high = 0;
        int medium = 0;
        int low = 0;

        for (ExposureFinding finding :
                report.getFindings()) {

            switch (
                    finding.getSeverity()
                            .toUpperCase(Locale.ROOT)
            ) {

                case "HIGH" ->
                        high++;

                case "MEDIUM" ->
                        medium++;

                default ->
                        low++;
            }
        }

        var source =
                report.getSummary();

        AdminScanSummary summary =
                AdminScanSummary.builder()
                        .totalDiscovered(
                                source.getTotalDiscovered()
                        )
                        .relevantAssets(
                                source.getRelevantAssets()
                        )
                        .totalFindings(
                                source.getTotalFindings()
                        )
                        .reachableFindings(
                                source.getReachableFindings()
                        )
                        .apiSurfaces(
                                source.getApiSurfaces()
                        )
                        .cloudStorageReferences(
                                source.getCloudStorageReferences()
                        )
                        .configurationSignals(
                                source.getConfigurationSignals()
                        )
                        .graphqlSurfaces(
                                source.getGraphqlSurfaces()
                        )
                        .highSeverity(high)
                        .mediumSeverity(medium)
                        .lowSeverity(low)
                        .build();

        return AdminExposureReport.builder()
                .domain(report.getDomain())
                .scannedAt(report.getScannedAt())
                .summary(summary)
                .findings(findings)
                .build();
    }

    private AdminExposureFinding toAdminFinding(
            ExposureFinding finding
    ) {

        return AdminExposureFinding.builder()
        .category(finding.getCategory())
        .severity(finding.getSeverity())
        .url(
                redactionService.redactUrl(
                        finding.getUrl()
                )
        )
        .reason(
                redactionService.redact(
                        finding.getReason()
                )
        )
        .discovered(
                finding.isDiscovered()
        )
        .targetOwned(
                finding.isTargetOwned()
        )
        .reachable(
                finding.isReachable()
        )
        .redirected(
                finding.isRedirected()
        )
        .authRequired(
                finding.isAuthRequired()
        )
        .loginRedirect(
                finding.isLoginRedirect()
        )
        .corsWildcard(
                finding.isCorsWildcard()
        )
        .status(
                finding.getStatus()
        )
        .contentType(
                redactionService.redact(
                        finding.getContentType()
                )
        )
        .riskLevel(
                finding.getRiskLevel()
        )
        .evidence(
                redactionService.redactList(
                        finding.getEvidence()
                )
        )
        .compliance(
                redactionService.redactList(
                        finding.getCompliance()
                )
        )
        .attackChainSignals(
                redactionService.redactList(
                        finding.getAttackChainSignals()
                )
        )
        .remediation(
                redactionService.redact(
                        finding.getRemediation()
                )
        )
        .build();
    }

    private String normalizeDomain(
            String value
    ) {

        return value
                .trim()
                .replaceFirst(
                        "^https?://",
                        ""
                )
                .split("/")[0]
                .split(":")[0]
                .toLowerCase(
                        Locale.ROOT
                );
    }

    private boolean isValidDomain(
            String domain
    ) {

        if (domain.isBlank()
                || domain.contains("..")
                || domain.contains(":")) {

            return false;
        }

        return domain.matches(
                "^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$"
        );
    }
}