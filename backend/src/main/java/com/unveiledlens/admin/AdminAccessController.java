package com.unveiledlens.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin-access")
@RequiredArgsConstructor
public class AdminAccessController {

    private final AdminAccessService adminAccessService;

    @PostMapping("/request")
    public ResponseEntity<?> requestAccess(
            @Valid @RequestBody AdminAccessRequestDto request
    ) {

        adminAccessService.requestAdminAccess(
                request.getEmail(),
                request.getDomain()
        );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Your admin access request has been submitted."
                )
        );
    }

    @GetMapping("/approval/{token}")
    public ResponseEntity<?> getApprovalStatus(
            @PathVariable String token
    ) {

        AdminAccessRequest request =
                adminAccessService.getApprovalRequest(
                        token
                );

        return ResponseEntity.ok(
                Map.of(
                        "status",
                        request.getStatus(),
                        "email",
                        request.getEmail(),
                        "domain",
                        request.getDomain() != null ? request.getDomain() : ""
                )
        );
    }

    @PostMapping("/approval/{token}")
    public ResponseEntity<?> approveOrReject(
            @PathVariable String token,
            @Valid @RequestBody AdminApprovalRequest request
    ) {

        adminAccessService.approveOrReject(
                token,
                request.getDecision()
        );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Admin access request processed."
                )
        );
    }

    @PostMapping("/verify-id")
    public ResponseEntity<?> verifyId(
            @Valid @RequestBody AdminVerifyRequest request
    ) {

        adminAccessService.verifyAdminId(
                request.getEmail(),
                request.getAdminId()
        );

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "Verification code sent to your email."
                )
        );
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(
            @Valid @RequestBody AdminOtpVerifyRequest request
    ) {

        String token =
                adminAccessService.verifyAdminOtp(
                        request.getEmail(),
                        request.getOtp()
                );

        return ResponseEntity.ok(
                Map.of(
                        "token",
                        token,
                        "message",
                        "Admin authentication successful."
                )
        );
    }
}