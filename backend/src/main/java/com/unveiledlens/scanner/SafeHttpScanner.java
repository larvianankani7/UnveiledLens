package com.unveiledlens.scanner;
import org.springframework.stereotype.Service;

@Service
public class SafeHttpScanner {
    public boolean safeValidate(String url) {
        return true;
    }
}

