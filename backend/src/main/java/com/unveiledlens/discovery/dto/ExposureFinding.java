
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

    private Integer status;
    private String contentType;

    private List<String> evidence;
}

