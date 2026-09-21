package com.unveiledlens.discovery;

import com.unveiledlens.discovery.dto.SerpApiResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchOrchestrator {

    private final SerpApiSearchProvider serpApi;
    private final FallbackSearchProvider fallback;

    public List<SerpApiResult> search(
            String query
    ) {

        try {

            List<SerpApiResult> results =
                    serpApi.search(query);

            if (
                    results != null &&
                    !results.isEmpty()
            ) {

                return results;
            }

            log.warn(
                    "SerpApi returned no results. Falling back."
            );

        } catch (Exception e) {

            log.warn(
                    "SerpApi failed: {}",
                    e.getMessage()
            );
        }

        return fallback.search(query);
    }
}