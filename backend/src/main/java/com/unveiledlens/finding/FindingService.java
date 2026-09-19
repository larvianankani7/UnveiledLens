package com.unveiledlens.finding;
import org.springframework.stereotype.Service;

@Service
public class FindingService {
    public String generateFinding(String asset) {
        return "Finding for " + asset;
    }
}

