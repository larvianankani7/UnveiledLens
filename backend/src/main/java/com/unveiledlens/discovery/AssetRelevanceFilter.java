package com.unveiledlens.discovery;

import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.Locale;
import java.util.Set;

@Service
public class AssetRelevanceFilter {

    private static final Set<String> IGNORED_PATHS = Set.of(
            "/",
            "/html",
            "/forms/post",
            "/base64",
            "/redirect-to"
    );

    public boolean isRelevant(
            String url,
            String title,
            String snippet
    ) {

        return isRelevant(
                url,
                title,
                snippet,
                false
        );
    }

    public boolean isRelevant(
            String url,
            String title,
            String snippet,
            boolean adminMode
    ) {

        if (url == null || url.isBlank()) {
            return false;
        }

        String searchable =
                (
                        safe(url)
                                + " "
                                + safe(title)
                                + " "
                                + safe(snippet)
                ).toLowerCase(Locale.ROOT);

        try {

            URI uri =
                    new URI(url);

            String path =
                    uri.getPath() == null
                            ? ""
                            : uri.getPath()
                            .toLowerCase(Locale.ROOT);

            String query =
                    uri.getQuery() == null
                            ? ""
                            : uri.getQuery()
                            .toLowerCase(Locale.ROOT);

            if (isIgnoredPath(path, query)) {
                return false;
            }

            if (path.contains("/redirect-to")
                    || path.startsWith("/base64/")) {

                return false;
            }

            if (containsObviousNoise(
                    searchable
            )) {

                return false;
            }

            if (adminMode) {

                return containsAdminSignal(
                        searchable,
                        path
                );
            }

            return containsTechnicalSignal(
                    searchable,
                    path
            );

        } catch (Exception e) {

            return false;
        }
    }

    private boolean isIgnoredPath(
            String path,
            String query
    ) {

        for (String ignored :
                IGNORED_PATHS) {

            if (path.equals(ignored)) {
                return true;
            }
        }

        return false;
    }

    private boolean containsTechnicalSignal(
            String searchable,
            String path
    ) {

        return containsAny(
                searchable,
                "swagger",
                "swagger-ui",
                "openapi",
                "api documentation",
                "api docs",
                "graphql",
                "/api/",
                "/v1/",
                "/v2/",
                "/v3/",
                "/api-docs",
                "/v3/api-docs",
                ".env",
                "configuration",
                "config file",
                "s3.amazonaws.com",
                "storage.googleapis.com",
                "blob.core.windows.net",
                "amazonaws.com"
        )
                || hasStructuredFileExtension(path);
    }

    private boolean containsAdminSignal(
            String searchable,
            String path
    ) {

        /*
         * Admin discovery is intentionally broader.
         * It is allowed to inspect developer-facing
         * and technical-looking resources that may
         * not contain an obvious security keyword.
         */

        if (containsAny(
                searchable,
                "swagger",
                "swagger-ui",
                "openapi",
                "api documentation",
                "api docs",
                "graphql",
                "developer portal",
                "developers",
                "api reference",
                "api reference documentation",
                "rest api",
                "web api",
                "api endpoint",
                "s3.amazonaws.com",
                "storage.googleapis.com",
                "blob.core.windows.net",
                "amazonaws.com",
                ".env",
                "config",
                "configuration"
        )) {

            return true;
        }

        if (containsAny(
                path,
                "/api/",
                "/v1/",
                "/v2/",
                "/v3/",
                "/graphql",
                "/swagger",
                "/openapi",
                "/developers",
                "/developer",
                "/api-docs"
        )) {

            return true;
        }

        return hasStructuredFileExtension(path);
    }

    private boolean hasStructuredFileExtension(
            String path
    ) {

        return path.endsWith(".json")
                || path.endsWith(".yaml")
                || path.endsWith(".yml")
                || path.endsWith(".xml");
    }

    private boolean containsObviousNoise(
            String searchable
    ) {

        return containsAny(
                searchable,
                "youtube.com",
                "youtu.be",
                "wikipedia.org",
                "reddit.com",
                "blog",
                "article",
                "news",
                "tutorial"
        );
    }

    private boolean containsAny(
            String value,
            String... terms
    ) {

        for (String term : terms) {

            if (value.contains(term)) {
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