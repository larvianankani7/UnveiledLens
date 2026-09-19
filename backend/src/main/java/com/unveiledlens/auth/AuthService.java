package com.unveiledlens.auth;
import com.unveiledlens.user.User;
import com.unveiledlens.user.UserRepository;
import com.unveiledlens.common.Role;
import com.unveiledlens.security.JwtService;
import com.unveiledlens.verification.OtpService;
import com.unveiledlens.audit.AuditService;
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
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_USER);
        userRepository.save(user);
        otpService.generateAndSendEmailOtp(request.getEmail());
        auditService.log("REGISTRATION", "User registered: " + request.getEmail(), user.getId());
        return new AuthResponse(null, "OTP sent to email");
    }

    public AuthResponse registerAdmin(AdminRegisterRequest request) {
        User user = new User();
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_ADMIN);
        userRepository.save(user);
        otpService.generateAndSendSmsOtp(request.getPhone());
        auditService.log("REGISTRATION", "Admin registered: " + request.getPhone(), user.getId());
        return new AuthResponse(null, "OTP sent to phone");
    }

    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        boolean valid = otpService.verifyOtp(request.getIdentifier(), request.getOtp());
        if (!valid) throw new RuntimeException("Invalid OTP");
        auditService.log("OTP_VERIFIED", "OTP verified for: " + request.getIdentifier(), null);
        return new AuthResponse(null, "Verified successfully");
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getIdentifier(), request.getPassword())
        );
        UserDetails user = userDetailsService.loadUserByUsername(request.getIdentifier());
        String jwtToken = jwtService.generateToken(user);
        auditService.log("LOGIN", "User logged in: " + request.getIdentifier(), null);
        return new AuthResponse(jwtToken, "Login successful");
    }
}

