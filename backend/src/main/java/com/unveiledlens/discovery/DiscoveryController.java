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

    @PostMapping("/scan")
    public ResponseEntity<?> startScan(@RequestBody Map<String, String> request) {
        String domain = request.get("domain");
        return ResponseEntity.ok(discoveryService.runDiscovery(domain));
    }
}

