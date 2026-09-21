
package com.unveiledlens.user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(
            Authentication authentication
    ) {

        User user = getAuthenticatedUser(authentication);

        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        if (user.getUsername() == null
                || user.getUsername().isBlank()) {

            user.setUsername(
                    createInitialUsername(user.getEmail())
            );

            userRepository.save(user);
        }

        UserProfileResponse response =
                new UserProfileResponse(
                        user.getUsername(),
                        user.getEmail(),
                        user.getDomain(),
                        user.getRole(),
                        "ACTIVE"
                );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile/username")
    public ResponseEntity<?> updateUsername(
            Authentication authentication,
            @Valid @RequestBody UpdateUsernameRequest request
    ) {

        User user = getAuthenticatedUser(authentication);

        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        String username =
                request.getUsername()
                        .trim();

        if (userRepository
                .findByUsername(username)
                .filter(existing ->
                        !existing.getId()
                                .equals(user.getId()))
                .isPresent()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            java.util.Map.of(
                                    "message",
                                    "That username is already in use."
                            )
                    );
        }

        user.setUsername(username);

        userRepository.save(user);

        return ResponseEntity.ok(
                java.util.Map.of(
                        "username",
                        username,
                        "message",
                        "Username updated successfully."
                )
        );
    }

    private User getAuthenticatedUser(
            Authentication authentication
    ) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            return null;
        }

        String identifier =
                authentication.getName();

        return userRepository
                .findByEmail(identifier)
                .orElseGet(() ->
                        userRepository
                                .findByPhone(identifier)
                                .orElse(null)
                );
    }

    private String createInitialUsername(
            String email
    ) {

        if (email == null
                || email.isBlank()) {

            return "user";
        }

        String localPart =
                email.substring(
                        0,
                        email.indexOf('@')
                );

        String base =
                localPart
                        .replaceAll(
                                "[^a-zA-Z0-9._-]",
                                ""
                        );

        if (base.length() < 3) {
            base = "user";
        }

        if (base.length() > 30) {
            base = base.substring(0, 30);
        }

        String username = base;
        int counter = 1;

        while (userRepository
                .findByUsername(username)
                .isPresent()) {

            String suffix =
                    String.valueOf(counter++);

            int maxBaseLength =
                    30 - suffix.length();

            String shortenedBase =
                    base.length() > maxBaseLength
                            ? base.substring(
                                    0,
                                    maxBaseLength
                            )
                            : base;

            username =
                    shortenedBase + suffix;
        }

        return username;
    }
}

