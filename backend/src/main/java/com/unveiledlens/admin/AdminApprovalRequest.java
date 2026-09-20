package com.unveiledlens.admin;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class AdminApprovalRequest {
    @NotBlank
    private String decision;
}