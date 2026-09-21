package com.unveiledlens.spec;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ApiSpecAnalyzer {

    private final ObjectMapper objectMapper =
            new ObjectMapper();

    public ApiSpecResult analyze(
            String body
    ) {

        if (
                body == null ||
                body.isBlank()
        ) {

            return empty();
        }

        try {

            JsonNode root =
                    objectMapper.readTree(body);

            boolean openApi =
                    root.has("openapi");

            boolean swagger =
                    root.has("swagger");

            if (!openApi && !swagger) {
                return empty();
            }

            String format =
                    openApi
                            ? "OPENAPI"
                            : "SWAGGER";

            JsonNode paths =
                    root.path("paths");

            if (!paths.isObject()) {

                return ApiSpecResult.builder()
                        .detected(true)
                        .format(format)
                        .endpointCount(0)
                        .unsecuredEndpointCount(0)
                        .unsecuredMethods(List.of())
                        .unsecuredPaths(List.of())
                        .deleteWithoutSecurity(false)
                        .adminLikeWithoutSecurity(false)
                        .build();
            }

            int endpointCount = 0;
            int unsecuredCount = 0;

            List<String> methods =
                    new ArrayList<>();

            List<String> unsecuredPaths =
                    new ArrayList<>();

            boolean deleteWithoutSecurity =
                    false;

            boolean adminLikeWithoutSecurity =
                    false;

            Iterator<Map.Entry<String, JsonNode>> fields =
                    paths.fields();

            while (fields.hasNext()) {

                Map.Entry<String, JsonNode> entry =
                        fields.next();

                String path =
                        entry.getKey();

                JsonNode operations =
                        entry.getValue();

                if (!operations.isObject()) {
                    continue;
                }

                Iterator<Map.Entry<String, JsonNode>> operationsIterator =
                        operations.fields();

                while (operationsIterator.hasNext()) {

                    Map.Entry<String, JsonNode> operation =
                            operationsIterator.next();

                    String method =
                            operation.getKey().toUpperCase();

                    if (!isHttpMethod(method)) {
                        continue;
                    }

                    endpointCount++;

                    JsonNode operationNode =
                            operation.getValue();

                    boolean secured =
                            hasSecurity(
                                    root,
                                    operationNode
                            );

                    if (!secured) {

                        unsecuredCount++;

                        methods.add(method);
                        unsecuredPaths.add(path);

                        if ("DELETE".equals(method)) {
                            deleteWithoutSecurity = true;
                        }

                        String lowerPath =
                                path.toLowerCase();

                        if (
                                lowerPath.contains("admin") ||
                                lowerPath.contains("internal") ||
                                lowerPath.contains("management")
                        ) {

                            adminLikeWithoutSecurity = true;
                        }
                    }
                }
            }

            return ApiSpecResult.builder()
                    .detected(true)
                    .format(format)
                    .endpointCount(endpointCount)
                    .unsecuredEndpointCount(unsecuredCount)
                    .unsecuredMethods(methods)
                    .unsecuredPaths(unsecuredPaths)
                    .deleteWithoutSecurity(deleteWithoutSecurity)
                    .adminLikeWithoutSecurity(adminLikeWithoutSecurity)
                    .build();

        } catch (Exception ignored) {

            return empty();
        }
    }

    private boolean hasSecurity(
            JsonNode root,
            JsonNode operation
    ) {

        JsonNode operationSecurity =
                operation.get("security");

        if (
                operationSecurity != null &&
                operationSecurity.isArray()
        ) {
            return !operationSecurity.isEmpty();
        }

        JsonNode rootSecurity =
                root.get("security");

        return rootSecurity != null
                && rootSecurity.isArray()
                && !rootSecurity.isEmpty();
    }

    private boolean isHttpMethod(
            String method
    ) {

        return switch (method) {

            case "GET",
                 "POST",
                 "PUT",
                 "PATCH",
                 "DELETE",
                 "OPTIONS",
                 "HEAD" -> true;

            default -> false;
        };
    }

    private ApiSpecResult empty() {

        return ApiSpecResult.builder()
                .detected(false)
                .format(null)
                .endpointCount(0)
                .unsecuredEndpointCount(0)
                .unsecuredMethods(List.of())
                .unsecuredPaths(List.of())
                .deleteWithoutSecurity(false)
                .adminLikeWithoutSecurity(false)
                .build();
    }
}