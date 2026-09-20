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

        User user =
                new User();

        user.setEmail(email);

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

        UserDetails user =
                userDetailsService
                        .loadUserByUsername(
                                identifier
                        );

        String jwtToken =
                jwtService.generateToken(
                        user
                );

        auditService.log(
                "LOGIN",
                "User logged in",
                account.getId()
        );

        return new AuthResponse(
                jwtToken,
                "Login successful"
        );
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
}