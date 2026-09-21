package com.unveiledlens.discovery;

import com.unveiledlens.discovery.dto.SerpApiResult;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FallbackSearchProvider
        implements SearchProvider {

    @Override
    public List<SerpApiResult> search(
            String query
    ) {

        return List.of();
    }

    @Override
    public String getName() {
        return "FALLBACK";
    }
}