package com.unveiledlens.discovery;

import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.Locale;

@Service
public class DomainRelevanceFilter {

    public boolean isRelevant(
            String url,
            String targetDomain
    ) {

        if (url == null
                || url.isBlank()
                || targetDomain == null
                || targetDomain.isBlank()) {

            return false;
        }

        try {

            URI uri =
                    new URI(url);

            String host =
                    uri.getHost();

            if (host == null) {
                return false;
            }

            host =
                    host.toLowerCase(Locale.ROOT);

            String domain =
                    targetDomain
                            .trim()
                            .toLowerCase(Locale.ROOT)
                            .replaceFirst(
                                    "^https?://",
                                    ""
                            )
                            .split("/")[0]
                            .split(":")[0];

            if (domain.startsWith("www.")) {
                domain =
                        domain.substring(4);
            }

            if (host.startsWith("www.")) {
                host =
                        host.substring(4);
            }

            return host.equals(domain)
                    || host.endsWith("." + domain);

        } catch (Exception e) {

            return false;
        }
    }
}