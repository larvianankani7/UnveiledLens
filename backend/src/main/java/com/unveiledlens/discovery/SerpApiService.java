package com.unveiledlens.discovery;
import org.springframework.stereotype.Service;

@Service
public class SerpApiService {
    public String search(String query) {
        return "SerpApi mock result for " + query;
    }
}

