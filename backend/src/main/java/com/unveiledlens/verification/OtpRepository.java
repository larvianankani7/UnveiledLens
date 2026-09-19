package com.unveiledlens.verification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findByTargetAndOtpAndUsedFalse(String target, String otp);
}

