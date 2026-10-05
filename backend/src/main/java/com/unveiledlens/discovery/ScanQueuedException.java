package com.unveiledlens.discovery;

public class ScanQueuedException extends RuntimeException {
    public ScanQueuedException() {
        super("The scan is still running in the background. Try again shortly; the completed result will be returned from cache.");
    }
}
