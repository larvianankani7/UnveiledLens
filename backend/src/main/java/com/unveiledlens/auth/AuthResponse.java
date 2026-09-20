package com.unveiledlens.auth;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String message;
    private Boolean requiresOtp;
    
    public AuthResponse(String token, String message) {
        this.token = token;
        this.message = message;
    }
    
    public AuthResponse(String token, String message, Boolean requiresOtp) {
        this.token = token;
        this.message = message;
        this.requiresOtp = requiresOtp;
    }
}

