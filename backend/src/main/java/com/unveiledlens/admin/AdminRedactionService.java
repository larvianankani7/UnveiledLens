package com.unveiledlens.admin;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AdminRedactionService {

    private static final Pattern EMAIL =
            Pattern.compile(
                    "(?i)\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b"
            );

    private static final Pattern JWT =
            Pattern.compile(
                    "\\beyJ[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\b"
            );

    private static final Pattern AWS_KEY =
            Pattern.compile(
                    "\\bAKIA[0-9A-Z]{16}\\b"
            );

    private static final Pattern IP =
            Pattern.compile(
                    "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b"
            );

    private static final Pattern SECRET_QUERY =
            Pattern.compile(
                    "(?i)([?&](?:token|key|api[_-]?key|secret|password|auth|access[_-]?token)=)[^&#\\s]+"
            );
            private static final Pattern AWS_ACCESS_KEY =
        Pattern.compile(
                "AKIA[0-9A-Z]{16}"
        );

private static final Pattern IPV4 =
        Pattern.compile(
                "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b"
        );

private static final Pattern SECRET_PARAMETER =
        Pattern.compile(
                "(?i)(token|apikey|api_key|key|secret|password|passwd|authorization)=([^&\\s]+)"
        );
    private static final Pattern UUID_PATTERN =
            Pattern.compile(
                    "(?i)\\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\b"
            );

    private static final Pattern HEX_HASH_PATTERN =
            Pattern.compile(
                    "\\b[0-9a-fA-F]{32,64}\\b"
            );

    private static final Pattern SENSITIVE_PATH_SEGMENT =
            Pattern.compile(
                    "(?i)(/(?:users?|accounts?|customers?|clients?|members?|profiles?|keys?|tokens?|secrets?|credentials?)/)(?:[a-zA-Z0-9_-]{5,}|\\d+)"
            );

    public String redactText(
            String value
    ) {

        if (value == null || value.isBlank()) {
            return value;
        }

        String redacted = value;

        redacted = EMAIL.matcher(redacted)
                .replaceAll("[EMAIL_REDACTED]");

        redacted = JWT.matcher(redacted)
                .replaceAll("[JWT_REDACTED]");

        redacted = AWS_ACCESS_KEY.matcher(redacted)
                .replaceAll("[AWS_KEY_REDACTED]");

        redacted = IPV4.matcher(redacted)
                .replaceAll("[IP_REDACTED]");

        redacted = SECRET_PARAMETER.matcher(redacted)
                .replaceAll("$1=[REDACTED]");

        return redacted;
    }

    public String redact(
            String value
    ) {

        if (value == null
                || value.isBlank()) {

            return value;
        }

        String result = value;

        result = EMAIL.matcher(result)
                .replaceAll("[REDACTED_EMAIL]");

        result = JWT.matcher(result)
                .replaceAll("[REDACTED_TOKEN]");

        result = AWS_KEY.matcher(result)
                .replaceAll("[REDACTED_AWS_KEY]");

        result = SECRET_QUERY.matcher(result)
                .replaceAll("$1[REDACTED]");

        result = SECRET_PARAMETER.matcher(result)
                .replaceAll("$1=[REDACTED]");

        result = IP.matcher(result)
                .replaceAll("[REDACTED_IP]");

        result = UUID_PATTERN.matcher(result)
                .replaceAll("[REDACTED_ID]");

        result = HEX_HASH_PATTERN.matcher(result)
                .replaceAll("[REDACTED_TOKEN]");

        return result;
    }

    public List<String> redactList(
            List<String> values
    ) {

        if (values == null) {
            return List.of();
        }

        return values.stream()
                .map(this::redact)
                .collect(
                        Collectors.toList()
                );
    }

    public String redactUrl(String url) {

        if (url == null || url.isBlank()) {
            return "[REDACTED_URL]";
        }

        try {
            String result = url.trim();

            result = EMAIL.matcher(result).replaceAll("[REDACTED_EMAIL]");
            result = JWT.matcher(result).replaceAll("[REDACTED_TOKEN]");
            result = AWS_KEY.matcher(result).replaceAll("[REDACTED_AWS_KEY]");
            result = IP.matcher(result).replaceAll("[REDACTED_IP]");
            result = UUID_PATTERN.matcher(result).replaceAll("[REDACTED_ID]");
            result = HEX_HASH_PATTERN.matcher(result).replaceAll("[REDACTED_TOKEN]");

            // Redact sensitive path parameters such as /users/12345 or /users/admin_user -> /users/***REDACTED***
            result = SENSITIVE_PATH_SEGMENT.matcher(result).replaceAll("$1***REDACTED***");

            // Redact known secret parameters
            result = SECRET_PARAMETER.matcher(result).replaceAll("$1=[REDACTED]");
            result = SECRET_QUERY.matcher(result).replaceAll("$1[REDACTED]");

            // Redact any remaining query parameter values to ensure zero query secrets leak
            result = result.replaceAll("(?i)([?&][a-zA-Z0-9_.-]+=)[^&#\\s]+", "$1[REDACTED]");

            return result;
        } catch (Exception e) {
            return "[REDACTED_URL]";
        }
    }
}