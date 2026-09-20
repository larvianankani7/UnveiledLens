
package com.unveiledlens.discovery.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SerpApiResult {

    private String url;
    private String title;
    private String snippet;
}

