package com.unveiledlens.verification;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtp(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("UnveiledLens Email Verification");
        message.setText(
                "Your UnveiledLens verification code is: " + otp + "\n\n" +
                "This code expires in 10 minutes.\n\n" +
                "If you did not request this verification, you can safely ignore this email."
        );

        mailSender.send(message);
    }
}

