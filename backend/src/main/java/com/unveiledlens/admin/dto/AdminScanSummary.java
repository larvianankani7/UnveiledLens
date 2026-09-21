package com.unveiledlens.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminScanSummary {

    private int totalDiscovered;
    private int relevantAssets;
    private int totalFindings;
    private int reachableFindings;

    private int apiSurfaces;
    private int cloudStorageReferences;
    private int configurationSignals;
    private int graphqlSurfaces;

    private int highSeverity;
    private int mediumSeverity;
    private int lowSeverity;
}