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

    public AuthResponse registerUser(
            RegisterRequest request
    ) {

        String email =
                normalizeEmail(
                        request.getEmail()
                );

        if (userRepository
                .findByEmail(email)
                .isPresent()) {

            throw new IllegalStateException(
                    "An account already exists with this email."
            );
        }

        String domain = normalizeDomain(request.getDomain());
        if (domain == null || domain.isEmpty()) {
            throw new IllegalArgumentException("A valid domain is required.");
        }

        User user =
                new User();

        user.setEmail(email);
        user.setDomain(domain);

        user.setPassword(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        user.setRole(
                Role.ROLE_USER
        );

        userRepository.save(user);

        try {

            otpService.generateAndSendEmailOtp(
                    email
            );

        } catch (RuntimeException exception) {

            userRepository.delete(user);

            throw new IllegalStateException(
                    "Unable to send verification email. "
                            + "Please check the email configuration.",
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

    public AuthResponse verifyOtp(
            VerifyOtpRequest request
    ) {

        String identifier =
                normalizeIdentifier(
                        request.getIdentifier()
                );

        boolean valid =
                otpService.verifyOtp(
                        identifier,
                        request.getOtp()
                );

        if (!valid) {

            throw new IllegalArgumentException(
                    "Invalid or expired OTP."
            );
        }

        User user =
                findUserByIdentifier(
                        identifier
                );

        if (user == null) {

            throw new IllegalArgumentException(
                    "No registration was found "
                            + "for this verification target."
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

    public AuthResponse login(
            LoginRequest request
    ) {

        String identifier =
                normalizeIdentifier(
                        request.getIdentifier()
                );

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        identifier,
                        request.getPassword()
                )
        );

        User account =
                findUserByIdentifier(
                        identifier
                );

        if (account == null) {

            throw new IllegalArgumentException(
                    "Invalid credentials."
            );
        }

        if (account.getRole()
                == Role.ROLE_ADMIN) {

            throw new IllegalArgumentException(
                    "Admin accounts must use "
                            + "Admin Authorization ID and email OTP."
            );
        }

        try {
            otpService.generateAndSendEmailOtp(account.getEmail());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to send login OTP.");
        }

        auditService.log(
                "LOGIN_OTP_REQUESTED",
                "User login OTP requested",
                account.getId()
        );

        return new AuthResponse(
                null,
                "Verification code sent to your email.",
                true
        );
    }

    public AuthResponse verifyLoginOtp(VerifyOtpRequest request) {
        String identifier = normalizeIdentifier(request.getIdentifier());
        
        boolean valid = otpService.verifyOtp(identifier, request.getOtp());
        if (!valid) {
            throw new IllegalArgumentException("Invalid or expired OTP.");
        }

        User user = findUserByIdentifier(identifier);
        if (user == null || user.getRole() != Role.ROLE_USER) {
            throw new IllegalArgumentException("Invalid user.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(identifier);
        String jwtToken = jwtService.generateToken(userDetails);

        auditService.log("LOGIN", "User logged in", user.getId());

        return new AuthResponse(jwtToken, "Login successful", false);
    }

    private User findUserByIdentifier(
            String identifier
    ) {

        if (identifier.contains("@")) {

            return userRepository
                    .findByEmail(identifier)
                    .orElse(null);
        }

        return userRepository
                .findByPhone(identifier)
                .orElse(null);
    }

    private String normalizeEmail(
            String email
    ) {

        return email == null
                ? ""
                : email.trim().toLowerCase();
    }

    private String normalizeIdentifier(
            String identifier
    ) {

        if (identifier == null) {
            return "";
        }

        String normalized =
                identifier.trim();

        if (normalized.contains("@")) {
            return normalized.toLowerCase();
        }

        return normalized;
    }

    private String normalizeDomain(String domain) {
        if (domain == null || domain.trim().isEmpty()) {
            return null;
        }
        String d = domain.trim().toLowerCase();
        if (d.startsWith("http://")) d = d.substring(7);
        if (d.startsWith("https://")) d = d.substring(8);
        if (d.endsWith("/")) d = d.substring(0, d.length() - 1);
        
        // Remove path/query if present
        if (d.contains("/")) {
            d = d.substring(0, d.indexOf("/"));
        }
        
        if (d.isEmpty() || d.equals("localhost") || d.startsWith("127.") || d.contains(":") || !d.contains(".")) {
            throw new IllegalArgumentException("Invalid domain provided.");
        }
        return d;
    }
}