package com.unveiledlens.admin;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminScanRequest {

    @NotBlank(
            message = "Target domain is required."
    )
    private String domain;
}