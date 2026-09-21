package com.unveiledlens.discovery;

import com.unveiledlens.discovery.dto.SerpApiResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SerpApiSearchProvider
        implements SearchProvider {

    private final SerpApiService serpApiService;

    @Override
    public List<SerpApiResult> search(
            String query
    ) {

        return serpApiService.search(query);
    }

    @Override
    public String getName() {
        return "SERPAPI";
    }
}