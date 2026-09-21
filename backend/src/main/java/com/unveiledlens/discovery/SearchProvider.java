package com.unveiledlens.discovery;

import com.unveiledlens.discovery.dto.SerpApiResult;

import java.util.List;

public interface SearchProvider {

    List<SerpApiResult> search(
            String query
    );

    String getName();
}