package com.unveiledlens.discovery.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ScanSummary {


private int totalDiscovered;
private int relevantAssets;
private int totalFindings;

private int reachableFindings;

private int apiSurfaces;
private int cloudStorageReferences;
private int configurationSignals;
private int graphqlSurfaces;


}
