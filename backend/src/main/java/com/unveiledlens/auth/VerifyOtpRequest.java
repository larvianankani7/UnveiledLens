package com.unveiledlens.auth;
import lombok.Data;
@Data
public class VerifyOtpRequest {
    private String identifier;
    private String otp;
}

