package com.unveiledlens.remediation;

import org.springframework.stereotype.Service;

@Service
public class RemediationTemplateService {

    public String getRemediation(
            String category,
            boolean corsWildcard,
            boolean authRequired
    ) {

        if (
                "CONFIGURATION".equals(category)
        ) {

            return """
                    Remove the configuration artifact from public exposure.
                    Rotate any credentials or secrets that may have been exposed.
                    Add deployment-time secret scanning to prevent recurrence.
                    """.trim();
        }

        if (
                "CLOUD_STORAGE".equals(category)
        ) {

            return """
                    Review the referenced storage resource and make its access policy explicit.
                    Remove unintended public access and rotate exposed credentials where applicable.
                    """.trim();
        }

        if (
                corsWildcard
                && (
                    "API_ENDPOINT".equals(category)
                    || "GRAPHQL".equals(category)
                )
        ) {

            return """
                    Replace wildcard CORS with an explicit allowlist of trusted origins.
                    Review credentialed cross-origin access and verify that sensitive endpoints are not broadly exposed.
                    """.trim();
        }

        if (
                "API_DOCUMENTATION".equals(category)
                && !authRequired
        ) {

            return """
                    Review whether the API documentation is intended to be public.
                    If the API is internal or sensitive, require authentication and prevent production documentation from being publicly indexed.
                    """.trim();
        }

        if (
                "API_ENDPOINT".equals(category)
                && !authRequired
        ) {

            return """
                    Review the endpoint's intended access model.
                    Require authentication and authorization where the resource is not intentionally public.
                    """.trim();
        }

        return """
                Review the discovered resource and confirm that its public exposure is intentional.
                Apply the minimum access required for the resource.
                """.trim();
    }
}