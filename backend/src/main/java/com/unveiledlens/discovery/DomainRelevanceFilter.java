
package com.unveiledlens.discovery;

import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;

@Service
public class DomainRelevanceFilter {

    public boolean isRelevant(
            String url,
            String targetDomain
    ) {

        if (url == null
                || targetDomain == null
                || url.isBlank()
                || targetDomain.isBlank()) {

            return false;
        }

        String normalizedDomain =
                normalizeDomain(targetDomain);

        try {

            URI uri =
                    new URI(url);

            String host =
                    uri.getHost();

            if (host == null || host.isBlank()) {
                return false;
            }

            String normalizedHost =
                    host.toLowerCase(Locale.ROOT);

            return normalizedHost.equals(
                    normalizedDomain
            )
                    || normalizedHost.endsWith(
                    "." + normalizedDomain
            );

        } catch (URISyntaxException e) {

            return false;
        }
    }

    private String normalizeDomain(String domain) {

        String normalized =
                domain.trim()
                        .toLowerCase(Locale.ROOT);

        normalized =
                normalized.replaceFirst(
                        "^https?://",
                        ""
                );

        normalized =
                normalized.split("/")[0];

        normalized =
                normalized.split(":")[0];

        if (normalized.startsWith("www.")) {
            normalized =
                    normalized.substring(4);
        }

        return normalized;
    }
}

