package com.unveiledlens.discovery.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserExposureSummary {


private int publiclyDiscovered;
private int potentialSignals;

private int apiSignals;
private int graphqlSignals;
private int configurationSignals;
private int storageSignals;


}
