package com.unveiledlens.auth;
import lombok.Data;
import lombok.AllArgsConstructor;
@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String message;
}

