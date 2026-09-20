
package com.unveiledlens.scanner;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URI;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class SafeHttpScanner {

    public Map<String, Object> safeValidate(
            String targetUrl
    ) {

        Map<String, Object> result =
                new HashMap<>();

        result.put("reachable", false);
        result.put("redirected", false);

        try {

            URI uri =
                    new URI(targetUrl);

            String host =
                    uri.getHost();

            if (host == null
                    || isInternal(host)) {

                result.put(
                        "blocked",
                        true
                );

                return result;
            }

            URL url =
                    uri.toURL();

            HttpURLConnection connection =
                    (HttpURLConnection)
                            url.openConnection();

            connection.setRequestMethod("HEAD");
            connection.setConnectTimeout(3000);
            connection.setReadTimeout(3000);

            connection.setInstanceFollowRedirects(
                    false
            );

            int status =
                    connection.getResponseCode();

            result.put(
                    "status",
                    status
            );

            result.put(
                    "contentType",
                    connection.getContentType()
            );

            if (status >= 300
                    && status < 400) {

                result.put(
                        "redirected",
                        true
                );

                String location =
                        connection.getHeaderField(
                                "Location"
                        );

                if (location != null
                        && !location.isBlank()) {

                    result.put(
                            "redirectLocation",
                            location
                    );
                }

            } else if (status >= 200
                    && status < 300) {

                result.put(
                        "reachable",
                        true
                );
            }

        } catch (Exception e) {

            log.debug(
                    "Validation failed for {}: {}",
                    targetUrl,
                    e.getMessage()
            );
        }

        return result;
    }

    private boolean isInternal(
            String host
    ) {

        if (host.equalsIgnoreCase("localhost")
                || host.endsWith(".local")) {

            return true;
        }

        try {

            InetAddress address =
                    InetAddress.getByName(host);

            byte[] addr =
                    address.getAddress();

            if (addr.length == 4) {

                int first =
                        addr[0] & 0xFF;

                int second =
                        addr[1] & 0xFF;

                if (first == 127) {
                    return true;
                }

                if (first == 10) {
                    return true;
                }

                if (first == 172
                        && second >= 16
                        && second <= 31) {

                    return true;
                }

                if (first == 192
                        && second == 168) {

                    return true;
                }

                if (first == 169
                        && second == 254) {

                    return true;
                }

                if (first == 0) {
                    return true;
                }
            }

            return address.isAnyLocalAddress()
                    || address.isLoopbackAddress()
                    || address.isLinkLocalAddress()
                    || address.isSiteLocalAddress();

        } catch (Exception e) {

            return true;
        }
    }
}

