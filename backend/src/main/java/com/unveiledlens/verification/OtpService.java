package com.unveiledlens.verification;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRATION_MINUTES = 10;

    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final SmsService smsService;
    private final PasswordEncoder passwordEncoder;

    private final SecureRandom secureRandom = new SecureRandom();

    public void generateAndSendEmailOtp(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        String otp = generateOtp();

        saveOtp(normalizedEmail, otp);
        emailService.sendOtp(normalizedEmail, otp);
    }

    public void generateAndSendSmsOtp(String phone) {
        String normalizedPhone = phone.trim();
        String otp = generateOtp();

        saveOtp(normalizedPhone, otp);
        smsService.sendOtp(normalizedPhone, otp);
    }

    public boolean verifyOtp(String target, String otp) {
        if (target == null || otp == null) {
            return false;
        }

        String normalizedTarget = target.trim();
        String normalizedOtp = otp.trim();

        return otpRepository
                .findTopByTargetAndUsedFalseOrderByCreatedAtDesc(normalizedTarget)
                .map(verification -> {
                    if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
                        return false;
                    }

                    if (!passwordEncoder.matches(
                            normalizedOtp,
                            verification.getOtp()
                    )) {
                        return false;
                    }

                    verification.setUsed(true);
                    otpRepository.save(verification);

                    return true;
                })
                .orElse(false);
    }

    private void saveOtp(String target, String otp) {
        OtpVerification verification = new OtpVerification();

        verification.setTarget(target);
        verification.setOtp(passwordEncoder.encode(otp));
        verification.setExpiresAt(
                LocalDateTime.now().plusMinutes(OTP_EXPIRATION_MINUTES)
        );
        verification.setUsed(false);
        verification.setCreatedAt(LocalDateTime.now());

        otpRepository.save(verification);
    }

    private String generateOtp() {
        int bound = (int) Math.pow(10, OTP_LENGTH);

        int value = secureRandom.nextInt(bound);

        return String.format("%0" + OTP_LENGTH + "d", value);
    }
}

