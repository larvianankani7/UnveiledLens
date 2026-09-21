package com.unveiledlens.compliance;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DpdpMappingService {

    public List<String> map(
            String category,
            boolean corsWildcard,
            boolean configurationExposure
    ) {

        List<String> sections =
                new ArrayList<>();

        if (
                configurationExposure ||
                "CLOUD_STORAGE".equals(category)
        ) {

            sections.add(
                    "DPDP Act 2023 — Section 8(5): reasonable security safeguards"
            );
        }

        if (
                corsWildcard &&
                (
                        "API_ENDPOINT".equals(category) ||
                        "GRAPHQL".equals(category)
                )
        ) {

            sections.add(
                    "DPDP Act 2023 — Section 8(5): reasonable security safeguards"
            );
        }

        return sections.stream()
                .distinct()
                .toList();
    }
}