
package com.unveiledlens.discovery;

import com.unveiledlens.user.User;
import com.unveiledlens.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/discovery")
@RequiredArgsConstructor
public class DiscoveryController {

    private final DiscoveryService discoveryService;
    private final UserRepository userRepository;

    @PostMapping("/scan")
    public ResponseEntity<?> startScan(
            Authentication authentication
    ) {

        if (authentication == null
                || !authentication.isAuthenticated()) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "error",
                                    "Authentication required."
                            )
                    );
        }

        String email =
                authentication.getName();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElse(null);

        if (user == null) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "error",
                                    "Authenticated user was not found."
                            )
                    );
        }

        String domain =
                user.getDomain();

        if (domain == null
                || domain.isBlank()) {

            return ResponseEntity
                    .status(
                            HttpStatus.UNPROCESSABLE_ENTITY
                    )
                    .body(
                            Map.of(
                                    "error",
                                    "No verified domain is associated with this account."
                            )
                    );
        }

        return ResponseEntity.ok(
                discoveryService.runDiscovery(
                        domain
                )
        );
    }
}

