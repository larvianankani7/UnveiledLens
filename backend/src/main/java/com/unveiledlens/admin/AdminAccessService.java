package com.unveiledlens.admin;

import com.unveiledlens.audit.AuditService;
import com.unveiledlens.common.Role;
import com.unveiledlens.security.JwtService;
import com.unveiledlens.user.User;
import com.unveiledlens.user.UserRepository;
import com.unveiledlens.verification.EmailService;
import com.unveiledlens.verification.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AdminAccessService {

    private static final int REQUEST_EXPIRATION_HOURS = 24;
    private static final int ADMIN_ID_EXPIRATION_DAYS = 30;

    private final AdminAccessRequestRepository repository;
    private final EmailService emailService;
    private final OtpService otpService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final AuditService auditService;

    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public void requestAdminAccess(String email) {

        String normalizedEmail =
                normalizeEmail(email);

        if (normalizedEmail.isBlank()) {
            throw new IllegalArgumentException(
                    "Email is required."
            );
        }

        String rawToken =
                generateSecureToken(32);

        AdminAccessRequest request =
                new AdminAccessRequest();

        request.setEmail(normalizedEmail);

        request.setRequestTokenHash(
                hash(rawToken)
        );

        request.setStatus("PENDING");

        request.setCreatedAt(
                LocalDateTime.now()
        );

        request.setExpiresAt(
                LocalDateTime.now()
                        .plusHours(REQUEST_EXPIRATION_HOURS)
        );

        repository.save(request);

        try {

            emailService.sendAdminApprovalRequest(
                    normalizedEmail,
                    rawToken
            );

        } catch (RuntimeException exception) {

            repository.delete(request);

            throw new IllegalStateException(
                    "Unable to submit admin access request.",
                    exception
            );
        }

        auditService.log(
                "ADMIN_ACCESS_REQUESTED",
                "Admin access request submitted",
                null
        );
    }

    @Transactional
    public String getApprovalStatus(String token) {

        AdminAccessRequest request =
                findRequestByToken(token);

        expireRequestIfNecessary(request);

        return request.getStatus();
    }

    @Transactional
    public void approveOrReject(
            String token,
            String decision
    ) {

        AdminAccessRequest request =
                findRequestByToken(token);

        expireRequestIfNecessary(request);

        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalStateException(
                    "This admin access request is no longer pending."
            );
        }

        String normalizedDecision =
                decision == null
                        ? ""
                        : decision.trim().toUpperCase();

        if ("APPROVE".equals(normalizedDecision)) {

            approve(request);

            return;
        }

        if ("REJECT".equals(normalizedDecision)) {

            reject(request);

            return;
        }

        throw new IllegalArgumentException(
                "Decision must be APPROVE or REJECT."
        );
    }

    @Transactional
    public void verifyAdminId(
            String email,
            String adminId
    ) {

        String normalizedEmail =
                normalizeEmail(email);

        AdminAccessRequest request =
                findLatestApprovedRequest(normalizedEmail);

        validateAdminAuthorization(
                request,
                normalizedEmail,
                adminId
        );

        otpService.generateAndSendEmailOtp(
                normalizedEmail
        );

        auditService.log(
                "ADMIN_ID_VERIFIED",
                "Admin Authorization ID verified; OTP requested",
                getExistingUserId(normalizedEmail)
        );
    }

    @Transactional
    public String verifyAdminOtp(
            String email,
            String otp
    ) {

        String normalizedEmail =
                normalizeEmail(email);

        AdminAccessRequest request =
                findLatestApprovedRequest(normalizedEmail);

        validateApprovedRequest(
                request
        );

        if (!otpService.verifyOtp(
                normalizedEmail,
                otp
        )) {

            throw new IllegalArgumentException(
                    "Invalid or expired OTP."
            );
        }

        User user =
                userRepository
                        .findByEmail(normalizedEmail)
                        .orElseGet(() -> {

                            User newUser =
                                    new User();

                            newUser.setEmail(
                                    normalizedEmail
                            );

                            newUser.setPassword(
                                    passwordEncoder.encode(
                                            generateSecureToken(32)
                                    )
                            );

                            return newUser;
                        });

        user.setRole(
                Role.ROLE_ADMIN
        );

        userRepository.save(user);

        UserDetails userDetails =
                userDetailsService
                        .loadUserByUsername(
                                normalizedEmail
                        );

        String jwt =
                jwtService.generateAdminToken(
                        userDetails
                );

        auditService.log(
                "ADMIN_OTP_VERIFIED",
                "Admin OTP verified",
                user.getId()
        );

        auditService.log(
                "ADMIN_LOGIN",
                "Admin authenticated",
                user.getId()
        );

        return jwt;
    }

    private void approve(
            AdminAccessRequest request
    ) {

        String adminId =
                generateSecureToken(24);

        request.setAdminIdHash(
                hash(adminId)
        );

        request.setStatus(
                "APPROVED"
        );

        request.setApprovedAt(
                LocalDateTime.now()
        );

        request.setAdminIdExpiresAt(
                LocalDateTime.now()
                        .plusDays(ADMIN_ID_EXPIRATION_DAYS)
        );

        repository.save(request);

        emailService.sendAdminApproved(
                request.getEmail(),
                adminId
        );

        auditService.log(
                "ADMIN_ACCESS_APPROVED",
                "Admin access request approved",
                null
        );
    }

    private void reject(
            AdminAccessRequest request
    ) {

        request.setStatus(
                "REJECTED"
        );

        request.setRejectedAt(
                LocalDateTime.now()
        );

        repository.save(request);

        emailService.sendAdminRejected(
                request.getEmail()
        );

        auditService.log(
                "ADMIN_ACCESS_REJECTED",
                "Admin access request rejected",
                null
        );
    }

    private void validateAdminAuthorization(
            AdminAccessRequest request,
            String email,
            String adminId
    ) {

        validateApprovedRequest(request);

        if (!request.getEmail().equals(email)) {
            throw new IllegalArgumentException(
                    "Invalid admin authorization."
            );
        }

        if (adminId == null || adminId.isBlank()) {
            throw new IllegalArgumentException(
                    "Invalid admin authorization."
            );
        }

        String suppliedHash =
                hash(adminId.trim());

        if (!MessageDigest.isEqual(
                suppliedHash.getBytes(StandardCharsets.UTF_8),
                request.getAdminIdHash()
                        .getBytes(StandardCharsets.UTF_8)
        )) {

            throw new IllegalArgumentException(
                    "Invalid admin authorization."
            );
        }

        if (request.getAdminIdExpiresAt() == null
                || request.getAdminIdExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new IllegalArgumentException(
                    "Admin Authorization ID has expired."
            );
        }
    }

    private void validateApprovedRequest(
            AdminAccessRequest request
    ) {

        expireRequestIfNecessary(request);

        if (!"APPROVED".equals(
                request.getStatus()
        )) {

            throw new IllegalArgumentException(
                    "Admin authorization is not active."
            );
        }

        if (request.getAdminIdExpiresAt() == null
                || request.getAdminIdExpiresAt()
                .isBefore(LocalDateTime.now())) {

            throw new IllegalArgumentException(
                    "Admin Authorization ID has expired."
            );
        }
    }

    private AdminAccessRequest findLatestApprovedRequest(
            String email
    ) {

        AdminAccessRequest request =
                repository
                        .findTopByEmailOrderByCreatedAtDesc(
                                email
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Invalid admin authorization."
                                )
                        );

        return request;
    }

    private AdminAccessRequest findRequestByToken(
            String token
    ) {

        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException(
                    "Invalid approval token."
            );
        }

        String tokenHash =
                hash(token);

        return repository
                .findByRequestTokenHash(tokenHash)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid approval token."
                        )
                );
    }

    private void expireRequestIfNecessary(
            AdminAccessRequest request
    ) {

        if ("PENDING".equals(
                request.getStatus()
        )
                && request.getExpiresAt() != null
                && request.getExpiresAt()
                .isBefore(LocalDateTime.now())) {

            request.setStatus(
                    "EXPIRED"
            );

            repository.save(request);

            auditService.log(
                    "ADMIN_ACCESS_EXPIRED",
                    "Admin access request expired",
                    null
            );
        }
    }

    private Long getExistingUserId(
            String email
    ) {

        return userRepository
                .findByEmail(email)
                .map(User::getId)
                .orElse(null);
    }

    private String normalizeEmail(
            String email
    ) {

        return email == null
                ? ""
                : email.trim().toLowerCase();
    }

    private String generateSecureToken(
            int byteLength
    ) {

        byte[] bytes =
                new byte[byteLength];

        secureRandom.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private String hash(
            String value
    ) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance(
                            "SHA-256"
                    );

            byte[] hashed =
                    digest.digest(
                            value.getBytes(
                                    StandardCharsets.UTF_8
                            )
                    );

            StringBuilder builder =
                    new StringBuilder();

            for (byte b : hashed) {
                builder.append(
                        String.format(
                                "%02x",
                                b
                        )
                );
            }

            return builder.toString();

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Unable to hash security value.",
                    exception
            );
        }
    }
}