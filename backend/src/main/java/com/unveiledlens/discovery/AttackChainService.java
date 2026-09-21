package com.unveiledlens.discovery;

import com.unveiledlens.discovery.dto.ExposureFinding;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AttackChainService {

    public List<String> correlate(
            List<ExposureFinding> findings
    ) {

        List<String> signals =
                new ArrayList<>();

        boolean configuration =
                hasCategory(
                        findings,
                        "CONFIGURATION"
                );

        boolean storage =
                hasCategory(
                        findings,
                        "CLOUD_STORAGE"
                );

        boolean apiDocumentation =
                hasCategory(
                        findings,
                        "API_DOCUMENTATION"
                );

        boolean apiEndpoint =
                hasCategory(
                        findings,
                        "API_ENDPOINT"
                );

        boolean cors =
                findings.stream()
                        .anyMatch(
                                ExposureFinding::isCorsWildcard
                        );

        boolean unsecuredAdmin =
                findings.stream()
                        .anyMatch(
                                finding ->
                                        finding.getAttackChainSignals() != null
                                        &&
                                        finding.getAttackChainSignals()
                                                .contains(
                                                        "UNPROTECTED_ADMIN_LIKE_API"
                                                )
                        );

        if (configuration && storage) {

            signals.add(
                    "CONFIGURATION_TO_CLOUD_STORAGE"
            );
        }

        if (
                apiDocumentation &&
                apiEndpoint &&
                cors
        ) {

            signals.add(
                    "API_DOCUMENTATION_TO_PUBLIC_API_WITH_WILDCARD_CORS"
            );
        }

        if (
                apiDocumentation &&
                unsecuredAdmin
        ) {

            signals.add(
                    "PUBLIC_API_DOCUMENTATION_TO_UNPROTECTED_ADMIN_LIKE_ENDPOINT"
            );
        }

        return signals;
    }

    private boolean hasCategory(
            List<ExposureFinding> findings,
            String category
    ) {

        return findings.stream()
                .anyMatch(
                        finding ->
                                category.equals(
                                        finding.getCategory()
                                )
                );
    }
}