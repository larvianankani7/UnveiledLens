package com.unveiledlens.auth;
import lombok.Data;
@Data
public class AdminRegisterRequest {
    private String phone;
    private String password;
    private String domain;
}

