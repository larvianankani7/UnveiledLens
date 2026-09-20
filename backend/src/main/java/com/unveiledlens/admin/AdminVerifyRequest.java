package com.unveiledlens.admin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class AdminVerifyRequest {
    @NotBlank
    @Email
    private String email;
    @NotBlank
    private String adminId;
}