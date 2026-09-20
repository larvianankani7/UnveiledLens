package com.unveiledlens.discovery.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ScanSummary {
    private int totalFindings;
    private int apiSurfaces;
    private int cloudStorageReferences;
    private int configurationSignals;
}
