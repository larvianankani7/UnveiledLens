package com.unveiledlens.discovery;

import com.unveiledlens.admin.AdminScanRequest;
import com.unveiledlens.discovery.dto.ExposureReport;
import com.unveiledlens.discovery.dto.ScanSummary;
import com.unveiledlens.discovery.dto.UserExposureReport;
import com.unveiledlens.discovery.dto.UserExposureSummary;
import com.unveiledlens.report.PdfReportService;
import com.unveiledlens.user.User;
import com.unveiledlens.user.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/discovery")
@RequiredArgsConstructor
public class DiscoveryController {

    private final DiscoveryService discoveryService;
    private final UserRepository userRepository;
    private final PdfReportService pdfReportService;


    @PostMapping("/report/pdf")
    public ResponseEntity<byte[]> generatePdf(
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null || user.getDomain() == null || user.getDomain().isBlank()) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).build();
        }

        String domain;
        try {
            domain = normalizeDomain(user.getDomain());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).build();
        }

        ExposureReport detailedReport = discoveryService.runDiscovery(domain);
        UserExposureReport userReport = buildUserReport(detailedReport);

        byte[] pdf = pdfReportService.generateUserReport(userReport);

        return ResponseEntity
                .ok()
                .header("Content-Disposition", "attachment; filename=\"unveiledlens-user-report.pdf\"")
                .header("Content-Type", "application/pdf")
                .body(pdf);
    }


    @PostMapping("/scan")
    public ResponseEntity<?> startScan(
            Authentication authentication
    ) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "error",
                                    "Authentication required."
                            )
                    );
        }

        String email =
                authentication.getName();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElse(null);

        if (user == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "error",
                                    "Authenticated user was not found."
                            )
                    );
        }

        String domain =
                user.getDomain();

        if (domain == null
                || domain.isBlank()) {

            return ResponseEntity
                    .status(
                            HttpStatus.UNPROCESSABLE_ENTITY
                    )
                    .body(
                            Map.of(
                                    "error",
                                    "No verified domain is associated with this account."
                            )
                    );
        }

        try {

            domain =
                    normalizeDomain(
                            domain
                    );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(
                            HttpStatus.UNPROCESSABLE_ENTITY
                    )
                    .body(
                            Map.of(
                                    "error",
                                    "The domain associated with this account is invalid."
                            )
                    );
        }

        ExposureReport detailedReport =
                discoveryService.runDiscovery(
                        domain
                );

        return ResponseEntity.ok(
                buildUserReport(
                        detailedReport
                )
        );
    }


    private String normalizeDomain(
            String domain
    ) {

        if (domain == null) {

            throw new IllegalArgumentException(
                    "Domain is required"
            );
        }

        String normalized =
                domain
                        .trim()
                        .toLowerCase();

        if (normalized.isBlank()) {

            throw new IllegalArgumentException(
                    "Domain is required"
            );
        }

        if (!normalized.startsWith("http://")
                && !normalized.startsWith("https://")) {

            normalized =
                    "https://" + normalized;
        }

        try {

            URI uri =
                    URI.create(
                            normalized
                    );

            String host =
                    uri.getHost();

            if (host == null
                    || host.isBlank()) {

                throw new IllegalArgumentException(
                        "Invalid domain"
                );
            }

            return host
                    .toLowerCase()
                    .replaceFirst(
                            "^www\\.",
                            ""
                    );

        } catch (Exception e) {

            throw new IllegalArgumentException(
                    "Invalid domain",
                    e
            );
        }
    }


    private boolean isValidDomain(
            String domain
    ) {

        if (domain == null
                || domain.isBlank()) {

            return false;
        }

        if (domain.length() > 253) {

            return false;
        }

        return domain.matches(
                "^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9-]{1,63}\\.)+[a-zA-Z]{2,63}$"
        );
    }


    private UserExposureReport buildUserReport(
            ExposureReport report
    ) {

        ScanSummary detailedSummary =
                report.getSummary();

        int potentialSignals =
                detailedSummary.getTotalFindings();

        String exposureLevel =
                determineExposureLevel(
                        potentialSignals
                );

        String overview =
                buildOverview(
                        potentialSignals,
                        detailedSummary.getReachableFindings()
                );

        UserExposureSummary summary =
                UserExposureSummary.builder()
                        .publiclyDiscovered(
                                detailedSummary
                                        .getTotalDiscovered()
                        )
                        .potentialSignals(
                                potentialSignals
                        )
                        .apiSignals(
                                detailedSummary
                                        .getApiSurfaces()
                        )
                        .graphqlSignals(
                                detailedSummary
                                        .getGraphqlSurfaces()
                        )
                        .configurationSignals(
                                detailedSummary
                                        .getConfigurationSignals()
                        )
                        .storageSignals(
                                detailedSummary
                                        .getCloudStorageReferences()
                        )
                        .build();

        return UserExposureReport.builder()
                .domain(
                        report.getDomain()
                )
                .scannedAt(
                        report.getScannedAt()
                )
                .exposureLevel(
                        exposureLevel
                )
                .overview(
                        overview
                )
                .summary(
                        summary
                )
                .build();
    }


    private String determineExposureLevel(
            int potentialSignals
    ) {

        if (potentialSignals == 0) {

            return "NO_SIGNIFICANT_SIGNALS";
        }

        if (potentialSignals <= 2) {

            return "LIMITED";
        }

        if (potentialSignals <= 5) {

            return "MODERATE";
        }

        return "ELEVATED";
    }


    private String buildOverview(
            int potentialSignals,
            int reachableSignals
    ) {

        if (potentialSignals == 0) {

            return "No significant public exposure signals were identified by the current discovery checks.";
        }

        if (reachableSignals == 0) {

            return "Several technical exposure signals were identified, but the current checks did not confirm direct public reachability.";
        }

        return "The scan identified technical resources that may deserve further security review.";
    }
}