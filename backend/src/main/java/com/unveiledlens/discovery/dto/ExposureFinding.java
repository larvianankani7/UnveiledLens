package com.unveiledlens.discovery.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExposureFinding {
    private String category;
    private String severity;
    private String url;
    private String reason;
    private boolean discovered;
    private boolean reachable;
    private Integer status;
    private String contentType;
}
