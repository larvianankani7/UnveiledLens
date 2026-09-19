package com.unveiledlens.auth;

import com.unveiledlens.audit.AuditService;
import com.unveiledlens.common.Role;
import com.unveiledlens.security.JwtService;
import com.unveiledlens.user.User;
import com.unveiledlens.user.UserRepository;
import com.unveiledlens.verification.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final OtpService otpService;
    private final AuditService auditService;

    public AuthResponse registerUser(RegisterRequest request) {

        String email = normalizeEmail(request.getEmail());

        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalStateException(
                    "An account already exists with this email."
            );
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_USER);

        /*
         * Save the account first because the OTP verification flow currently
         * identifies the pending registration by email.
         */
        userRepository.save(user);

        try {
            otpService.generateAndSendEmailOtp(email);
        } catch (RuntimeException exception) {
            userRepository.delete(user);
            throw new IllegalStateException(
                    "Unable to send verification email. Please check the email configuration.",
                    exception
            );
        }

        auditService.log(
                "OTP_REQUESTED",
                "User email OTP requested",
                user.getId()
        );

        return new AuthResponse(
                null,
                "Verification code sent to your email."
        );
    }

    public AuthResponse registerAdmin(AdminRegisterRequest request) {

        String phone = normalizePhone(request.getPhone());

        if (userRepository.findByPhone(phone).isPresent()) {
            throw new IllegalStateException(
                    "An account already exists with this phone number."
            );
        }

        User user = new User();
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_ADMIN);

        userRepository.save(user);

        try {
            otpService.generateAndSendSmsOtp(phone);
        } catch (RuntimeException exception) {
            userRepository.delete(user);
            throw new IllegalStateException(
                    "Unable to send verification SMS. Please check the SMS provider configuration.",
                    exception
            );
        }

        auditService.log(
                "ADMIN_PHONE_VERIFICATION_REQUESTED",
                "Admin phone OTP requested",
                user.getId()
        );

        return new AuthResponse(
                null,
                "Verification code sent to your phone."
        );
    }

    public AuthResponse verifyOtp(VerifyOtpRequest request) {

        String identifier = normalizeIdentifier(request.getIdentifier());

        boolean valid = otpService.verifyOtp(
                identifier,
                request.getOtp()
        );

        if (!valid) {
            throw new IllegalArgumentException("Invalid or expired OTP.");
        }

        User user = findUserByIdentifier(identifier);

        if (user == null) {
            throw new IllegalArgumentException(
                    "No registration was found for this verification target."
            );
        }

        auditService.log(
                "OTP_VERIFIED",
                "Registration OTP verified",
                user.getId()
        );

        return new AuthResponse(
                null,
                "Verified successfully."
        );
    }

    public AuthResponse login(LoginRequest request) {

        String identifier = normalizeIdentifier(request.getIdentifier());

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        identifier,
                        request.getPassword()
                )
        );

        UserDetails user =
                userDetailsService.loadUserByUsername(identifier);

        String jwtToken = jwtService.generateToken(user);

        auditService.log(
                "LOGIN",
                "User logged in",
                null
        );

        return new AuthResponse(
                jwtToken,
                "Login successful"
        );
    }

    private User findUserByIdentifier(String identifier) {

        if (identifier.contains("@")) {
            return userRepository.findByEmail(identifier).orElse(null);
        }

        return userRepository.findByPhone(identifier).orElse(null);
    }

    private String normalizeEmail(String email) {
        return email == null
                ? ""
                : email.trim().toLowerCase();
    }

    private String normalizePhone(String phone) {
        return phone == null
                ? ""
                : phone.trim();
    }

    private String normalizeIdentifier(String identifier) {

        if (identifier == null) {
            return "";
        }

        String normalized = identifier.trim();

        if (normalized.contains("@")) {
            return normalized.toLowerCase();
        }

        return normalized;
    }
}

