package com.unveiledlens.discovery;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DiscoveryService {
    private final SerpApiService serpApiService;

    public String runDiscovery(String domain) {
        String results = serpApiService.search(domain);
        return "Discovery completed for " + domain + ". Found: " + results;
    }
}

