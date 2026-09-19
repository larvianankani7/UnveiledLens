package com.unveiledlens.verification;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "otp_verifications")
public class OtpVerification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String target; // email or phone
    private String otp;
    private LocalDateTime expiresAt;
    private boolean used;
    private LocalDateTime createdAt = LocalDateTime.now();
}

