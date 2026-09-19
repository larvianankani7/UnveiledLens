package com.unveiledlens.ai;
import org.springframework.stereotype.Service;

@Service
public class OllamaService {
    public String interpret(String finding) {
        return "AI interpretation for " + finding;
    }
}

