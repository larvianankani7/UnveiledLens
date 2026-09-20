package com.unveiledlens.discovery.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserExposureReport {

private String domain;
private String scannedAt;

private String exposureLevel;
private String overview;

private UserExposureSummary summary;


}
