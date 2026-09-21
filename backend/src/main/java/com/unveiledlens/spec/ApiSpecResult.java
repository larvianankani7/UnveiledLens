package com.unveiledlens.spec;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ApiSpecResult {

    private boolean detected;

    private String format;

    private int endpointCount;

    private int unsecuredEndpointCount;

    private List<String> unsecuredMethods;

    private List<String> unsecuredPaths;

    private boolean deleteWithoutSecurity;

    private boolean adminLikeWithoutSecurity;
}