package com.unveiledlens.discovery.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ExposureReport {
    private String domain;
    private String scannedAt;
    private ScanSummary summary;
    private List<ExposureFinding> findings;
}
