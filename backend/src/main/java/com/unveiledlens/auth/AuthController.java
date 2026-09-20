package com.unveiledlens.auth;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/user")
    public ResponseEntity<?> registerUser(
            @RequestBody RegisterRequest request
    ) {

        return ResponseEntity.ok(
                authService.registerUser(request)
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @RequestBody VerifyOtpRequest request
    ) {

        return ResponseEntity.ok(
                authService.verifyOtp(request)
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        return ResponseEntity.ok(
                authService.login(request)
        );
    }

    @PostMapping("/login/verify-otp")
    public ResponseEntity<?> verifyLoginOtp(
            @RequestBody VerifyOtpRequest request
    ) {
        return ResponseEntity.ok(
                authService.verifyLoginOtp(request)
        );
    }
}