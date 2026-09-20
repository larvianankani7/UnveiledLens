package com.unveiledlens.discovery;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/discovery")
@RequiredArgsConstructor
public class DiscoveryController {
    private final DiscoveryService discoveryService;
    private final com.unveiledlens.user.UserRepository userRepository;

    @PostMapping("/scan")
    public ResponseEntity<?> startScan(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        
        String identifier = authentication.getName();
        com.unveiledlens.user.User user = userRepository.findByEmail(identifier).orElse(null);
        if (user == null) {
            user = userRepository.findByPhone(identifier).orElse(null);
        }
        
        if (user == null || user.getDomain() == null || user.getDomain().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No valid domain associated with this user"));
        }

        return ResponseEntity.ok(discoveryService.runDiscovery(user.getDomain()));
    }
}

