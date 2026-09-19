package com.unveiledlens.verification;
import org.springframework.stereotype.Service;

@Service
public class SmsService {
    public void sendOtp(String to, String otp) {
        System.out.println("Sending OTP " + otp + " to phone " + to);
    }
}

