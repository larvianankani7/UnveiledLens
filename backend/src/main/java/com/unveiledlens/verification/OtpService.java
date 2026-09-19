package com.unveiledlens.verification;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {
    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final SmsService smsService;

    public void generateAndSendEmailOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        OtpVerification verification = new OtpVerification();
        verification.setTarget(email);
        verification.setOtp(otp);
        verification.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        otpRepository.save(verification);
        emailService.sendOtp(email, otp);
    }
    
    public void generateAndSendSmsOtp(String phone) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        OtpVerification verification = new OtpVerification();
        verification.setTarget(phone);
        verification.setOtp(otp);
        verification.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        otpRepository.save(verification);
        smsService.sendOtp(phone, otp);
    }

    public boolean verifyOtp(String target, String otp) {
        return otpRepository.findByTargetAndOtpAndUsedFalse(target, otp)
            .map(v -> {
                if (v.getExpiresAt().isBefore(LocalDateTime.now())) return false;
                v.setUsed(true);
                otpRepository.save(v);
                return true;
            }).orElse(false);
    }
}

