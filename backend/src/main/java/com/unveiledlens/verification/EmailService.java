package com.unveiledlens.verification;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    @Value("${admin.approval-email:}")
    private String approvalEmail;
    @Value("${admin.approval-base-url:http://localhost:3000/admin-approval}")
    private String approvalBaseUrl;
    public void sendOtp(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("UnveiledLens Email Verification");
        message.setText(
                "Your UnveiledLens verification code is: " + otp +
                "\n\n" +
                "This code expires in 10 minutes." +
                "\n\n" +
                "If you did not request this verification, you can safely ignore this email."
        );
        mailSender.send(message);
    }

    public void sendAdminApprovalRequest(
            String requesterEmail,
            String approvalToken
    ) {
        if (approvalEmail == null || approvalEmail.isBlank()) {
            throw new IllegalStateException(
                    "Admin approval email is not configured."
            );
        }
        String approvalUrl =
                approvalBaseUrl + "/" + approvalToken;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(approvalEmail);
        message.setSubject("UnveiledLens Admin Access Request");
        message.setText(
                "A new UnveiledLens admin access request has been submitted."
                        + "\n\n"
                        + "Requester: " + requesterEmail
                        + "\n\n"
                        + "Review the request here:"
                        + "\n"
                        + approvalUrl
                        + "\n\n"
                        + "This approval request expires in 24 hours."
                        + "\n\n"
                        + "If you did not expect this request, ignore this email."
        );

        mailSender.send(message);
    }
    public void sendAdminApproved(
            String to,
            String adminId
    ) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("UnveiledLens Admin Access Approved");
        message.setText(
                "Your UnveiledLens admin access request has been approved."
                        + "\n\n"
                        + "Your Admin Authorization ID is:"
                        + "\n\n"
                        + adminId
                        + "\n\n"
                        + "This Authorization ID expires in 30 days."
                        + "\n\n"
                        + "Keep this ID private. It is required together with your email "
                        + "to begin admin authentication."
                        + "\n\n"
                        + "You will also receive an email OTP whenever you authenticate "
                        + "a new admin session."
        );
        mailSender.send(message);
    }
    public void sendAdminRejected(String to) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("UnveiledLens Admin Access Request");

        message.setText(
                "Your UnveiledLens admin access request was not approved."
                        + "\n\n"
                        + "If you believe this was a mistake, please contact "
                        + "the UnveiledLens developer."
        );
        mailSender.send(message);
    }
}
