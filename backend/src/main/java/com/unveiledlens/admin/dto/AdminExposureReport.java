package com.unveiledlens.admin.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminExposureReport {

    private String domain;
    private String scannedAt;
    private AdminScanSummary summary;
    private List<AdminExposureFinding> findings;
}