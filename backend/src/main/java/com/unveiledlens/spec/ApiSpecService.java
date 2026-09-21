package com.unveiledlens.spec;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;

@Service
@RequiredArgsConstructor
public class ApiSpecService {

    private final ApiSpecAnalyzer analyzer;

    public ApiSpecResult analyze(
            String targetUrl
    ) {

        try {

            URI uri =
                    new URI(targetUrl);

            String scheme =
                    uri.getScheme();

            String host =
                    uri.getHost();

            if (
                    host == null ||
                    (
                        !scheme.equalsIgnoreCase("http") &&
                        !scheme.equalsIgnoreCase("https")
                    )
            ) {
                return empty();
            }

            URL url =
                    uri.toURL();

            HttpURLConnection connection =
                    (HttpURLConnection)
                            url.openConnection();

            connection.setRequestMethod("GET");

            connection.setConnectTimeout(3000);
            connection.setReadTimeout(5000);

            connection.setInstanceFollowRedirects(false);

            connection.setRequestProperty(
                    "User-Agent",
                    "UnveiledLens-Security-Audit/1.0"
            );

            int status =
                    connection.getResponseCode();

            if (
                    status < 200 ||
                    status >= 300
            ) {
                return empty();
            }

            String contentType =
                    connection.getContentType();

            if (
                    contentType == null ||
                    !(
                        contentType.contains("json") ||
                        contentType.contains("yaml") ||
                        contentType.contains("text")
                    )
            ) {
                return empty();
            }

            String body =
                    new String(
                            connection.getInputStream().readAllBytes()
                    );

            if (body.length() > 1_000_000) {
                return empty();
            }

            return analyzer.analyze(body);

        } catch (Exception ignored) {

            return empty();
        }
    }

    private ApiSpecResult empty() {

        return ApiSpecResult.builder()
                .detected(false)
                .endpointCount(0)
                .unsecuredEndpointCount(0)
                .unsecuredMethods(java.util.List.of())
                .unsecuredPaths(java.util.List.of())
                .deleteWithoutSecurity(false)
                .adminLikeWithoutSecurity(false)
                .build();
    }
}