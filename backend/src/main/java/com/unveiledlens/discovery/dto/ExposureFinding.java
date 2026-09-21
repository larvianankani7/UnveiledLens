package com.unveiledlens.discovery.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ExposureFinding {

    private String category;
    private String severity;

    private String url;
    private String reason;

    private boolean discovered;
    private boolean targetOwned;
    private boolean reachable;
    private boolean redirected;

    private boolean authRequired;
    private boolean loginRedirect;
    private boolean corsWildcard;

    private Integer status;
    private String contentType;

    private String riskLevel;

    private List<String> evidence;
    private List<String> compliance;
    private List<String> attackChainSignals;

    private String remediation;
}