package com.unveiledlens.discovery;

import com.unveiledlens.discovery.dto.ExposureReport;
import com.unveiledlens.discovery.dto.ScanSummary;
import com.unveiledlens.discovery.dto.UserExposureReport;
import com.unveiledlens.discovery.dto.UserExposureSummary;
import com.unveiledlens.user.User;
import com.unveiledlens.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/discovery")
@RequiredArgsConstructor
public class DiscoveryController {


private final DiscoveryService discoveryService;
private final UserRepository userRepository;

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

    ExposureReport detailedReport =
            discoveryService.runDiscovery(domain);

    return ResponseEntity.ok(
            buildUserReport(detailedReport)
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
                            detailedSummary.getTotalDiscovered()
                    )
                    .potentialSignals(
                            potentialSignals
                    )
                    .apiSignals(
                            detailedSummary.getApiSurfaces()
                    )
                    .graphqlSignals(
                            detailedSummary.getGraphqlSurfaces()
                    )
                    .configurationSignals(
                            detailedSummary.getConfigurationSignals()
                    )
                    .storageSignals(
                            detailedSummary.getCloudStorageReferences()
                    )
                    .build();

    return UserExposureReport.builder()
            .domain(report.getDomain())
            .scannedAt(report.getScannedAt())
            .exposureLevel(exposureLevel)
            .overview(overview)
            .summary(summary)
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
