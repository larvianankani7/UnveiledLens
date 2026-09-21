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
        result.put("authRequired", false);
        result.put("loginRedirect", false);
        result.put("corsWildcard", false);

        try {

            URI uri =
                    new URI(targetUrl);

            String scheme =
                    uri.getScheme();

            String host =
                    uri.getHost();

            if (
                    scheme == null ||
                    (
                        !scheme.equalsIgnoreCase("http") &&
                        !scheme.equalsIgnoreCase("https")
                    ) ||
                    host == null ||
                    isInternal(host)
            ) {

                result.put("blocked", true);

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

            connection.setInstanceFollowRedirects(false);

            connection.setRequestProperty(
                    "User-Agent",
                    "UnveiledLens-Security-Audit/1.0"
            );

            int status =
                    connection.getResponseCode();

            String contentType =
                    connection.getContentType();

            String location =
                    connection.getHeaderField(
                            "Location"
                    );

            String authenticate =
                    connection.getHeaderField(
                            "WWW-Authenticate"
                    );

            String cors =
                    connection.getHeaderField(
                            "Access-Control-Allow-Origin"
                    );

            result.put(
                    "status",
                    status
            );

            result.put(
                    "contentType",
                    contentType
            );

            if (
                    cors != null &&
                    cors.trim().equals("*")
            ) {

                result.put(
                        "corsWildcard",
                        true
                );
            }

            if (
                    authenticate != null &&
                    !authenticate.isBlank()
            ) {

                result.put(
                        "authRequired",
                        true
                );
            }

            if (
                    status == 401 ||
                    status == 403
            ) {

                result.put(
                        "authRequired",
                        true
                );
            }

            if (
                    status >= 300 &&
                    status < 400
            ) {

                result.put(
                        "redirected",
                        true
                );

                if (
                        location != null &&
                        !location.isBlank()
                ) {

                    result.put(
                            "redirectLocation",
                            location
                    );

                    if (looksLikeLoginRedirect(location)) {

                        result.put(
                                "loginRedirect",
                                true
                        );

                        result.put(
                                "authRequired",
                                true
                        );
                    }
                }

            } else if (
                    status >= 200 &&
                    status < 300
            ) {

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

    private boolean looksLikeLoginRedirect(
            String location
    ) {

        String value =
                location.toLowerCase();

        return value.contains("/login")
                || value.contains("/signin")
                || value.contains("/sign-in")
                || value.contains("/authenticate")
                || value.contains("/auth/login");
    }

    private boolean isInternal(
            String host
    ) {

        try {

            InetAddress address =
                    InetAddress.getByName(host);

            if (
                    address.isAnyLocalAddress() ||
                    address.isLoopbackAddress() ||
                    address.isLinkLocalAddress() ||
                    address.isSiteLocalAddress()
            ) {
                return true;
            }

            String ip =
                    address.getHostAddress();

            return isPrivateIpv4(ip);

        } catch (Exception e) {

            return true;
        }
    }

    private boolean isPrivateIpv4(
            String ip
    ) {

        String[] parts =
                ip.split("\\.");

        if (parts.length != 4) {
            return false;
        }

        try {

            int a =
                    Integer.parseInt(parts[0]);

            int b =
                    Integer.parseInt(parts[1]);

            if (a == 10) {
                return true;
            }

            if (a == 127) {
                return true;
            }

            if (a == 172 && b >= 16 && b <= 31) {
                return true;
            }

            return a == 192 && b == 168;

        } catch (NumberFormatException e) {

            return false;
        }
    }
}