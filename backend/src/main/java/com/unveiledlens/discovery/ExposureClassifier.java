package com.unveiledlens.discovery;

import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class ExposureClassifier {

    public String classify(
            String url,
            String title,
            String snippet
    ) {

        String normalizedUrl =
                safe(url)
                        .toLowerCase(Locale.ROOT);

        String normalizedTitle =
                safe(title)
                        .toLowerCase(Locale.ROOT);

        String normalizedSnippet =
                safe(snippet)
                        .toLowerCase(Locale.ROOT);

        String text =
                normalizedTitle
                        + " "
                        + normalizedSnippet;

        /*
         * 1. API DOCUMENTATION
         *
         * Strong URL signals.
         */

        if (containsAny(
                normalizedUrl,
                "/swagger",
                "/swagger-ui",
                "/openapi",
                "/api-docs",
                "/v3/api-docs",
                "/v2/api-docs"
        )) {

            return "API_DOCUMENTATION";
        }

        /*
         * Strong search-result signals.
         *
         * We require combinations such as
         * "api" + "documentation", rather than
         * simply seeing the word "api".
         */

        if (containsAny(
                normalizedTitle,
                "swagger ui",
                "swagger-ui",
                "openapi",
                "api documentation",
                "api docs",
                "api reference"
        )) {

            return "API_DOCUMENTATION";
        }

        if (
                containsAny(
                        normalizedSnippet,
                        "swagger ui",
                        "swagger-ui",
                        "openapi",
                        "api documentation",
                        "api docs"
                )
        ) {

            return "API_DOCUMENTATION";
        }

        /*
         * 2. GRAPHQL
         *
         * URL is strongest signal.
         */

        if (isGraphqlPath(normalizedUrl)) {

            return "GRAPHQL";
        }

        /*
         * Search result must contain an explicit
         * GraphQL technical phrase, not just the
         * word "graphql" in ordinary content.
         */

        if (containsAny(
                normalizedTitle,
                "graphql api",
                "graphql endpoint",
                "graphql documentation",
                "graphql api reference"
        )) {

            return "GRAPHQL";
        }

        /*
         * 3. API ENDPOINT
         */

        if (containsApiEndpoint(
                normalizedUrl
        )) {

            return "API_ENDPOINT";
        }

        /*
         * Search result evidence can identify
         * API surfaces even when Google indexes
         * the documentation page rather than the
         * endpoint itself.
         */

        if (containsApiDocumentationSignal(
                text
        )) {

            return "API_DOCUMENTATION";
        }

        /*
         * 4. CLOUD STORAGE
         */

        if (containsCloudStorage(
                normalizedUrl,
                text
        )) {

            return "CLOUD_STORAGE";
        }

        /*
         * 5. CONFIGURATION
         */

        if (containsConfiguration(
                normalizedUrl,
                text
        )) {

            return "CONFIGURATION";
        }

        /*
         * Nothing technically meaningful found.
         */

        return "NONE";
    }


    public String getSeverity(
            String category
    ) {

        return switch (category) {

            case "CONFIGURATION" ->
                    "HIGH";

            case "API_DOCUMENTATION",
                 "CLOUD_STORAGE" ->
                    "MEDIUM";

            case "GRAPHQL",
                 "API_ENDPOINT" ->
                    "LOW";

            default ->
                    "NONE";
        };
    }


    private boolean containsApiDocumentationSignal(
            String text
    ) {

        boolean api =
                text.contains("api");

        boolean documentation =
                text.contains("documentation")
                        || text.contains("api docs")
                        || text.contains("api reference")
                        || text.contains("developer portal");

        boolean technicalFormat =
                text.contains("openapi")
                        || text.contains("swagger")
                        || text.contains("rest api");

        return
                (api && documentation)
                        || technicalFormat;
    }


    private boolean isGraphqlPath(
            String url
    ) {

        return url.equals("/graphql")
                || url.startsWith("/graphql/")
                || url.contains("/graphql?");
    }


    private boolean containsApiEndpoint(
            String url
    ) {

        return url.contains("/api/")
                || url.contains("/api?")
                || url.matches(
                        ".*?/api$"
                )
                || url.contains("/v1/")
                || url.contains("/v2/")
                || url.contains("/v3/");
    }


    private boolean containsCloudStorage(
            String url,
            String text
    ) {

        return containsAny(
                url,
                "s3.amazonaws.com",
                "storage.googleapis.com",
                "blob.core.windows.net"
        )
                || containsAny(
                text,
                "s3.amazonaws.com",
                "storage.googleapis.com",
                "blob.core.windows.net"
        );
    }


    private boolean containsConfiguration(
            String url,
            String text
    ) {

        boolean fileExtension =
                url.matches(
                        ".*\\.(env|yaml|yml|json|xml|conf|config)(/|\\?|$)"
                );

        boolean configPath =
                url.contains("/.env")
                        || url.contains("/config.json")
                        || url.contains("/config.yaml")
                        || url.contains("/config.yml");

        boolean configReference =
                text.contains(".env")
                        || text.contains("application.yml")
                        || text.contains("application.yaml")
                        || text.contains("configuration file");

        return fileExtension
                || configPath
                || configReference;
    }


    private boolean containsAny(
            String value,
            String... signals
    ) {

        for (String signal : signals) {

            if (value.contains(signal)) {
                return true;
            }
        }

        return false;
    }


    private String safe(
            String value
    ) {

        return value == null
                ? ""
                : value;
    }
}