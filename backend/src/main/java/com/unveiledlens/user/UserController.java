package com.unveiledlens.user;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        
        String identifier = authentication.getName();
        User user = userRepository.findByEmail(identifier).orElse(null);
        if (user == null) {
            user = userRepository.findByPhone(identifier).orElse(null);
        }
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        UserProfileResponse response = new UserProfileResponse(
            user.getEmail(),
            user.getDomain(),
            user.getRole()
        );
        return ResponseEntity.ok(response);
    }
}
