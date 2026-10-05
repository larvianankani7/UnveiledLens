package com.unveiledlens.discovery;
import com.unveiledlens.discovery.dto.ExposureReport;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Iterator;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.function.Supplier;

@Service
public class ScanCacheService {
    private final Map<String, CachedReport> completed = new ConcurrentHashMap<>();
    private final Map<String, CompletableFuture<ExposureReport>> inFlight = new ConcurrentHashMap<>();
    private final Executor coordinator;
    private final long ttlMillis;
    private final long waitMillis;
    private final int maxEntries;
    public ScanCacheService(@Qualifier("discoveryCoordinatorExecutor") Executor coordinator, @Value("${discovery.cache-ttl-minutes:15}") long ttlMinutes, @Value("${discovery.request-wait-seconds:60}") long waitSeconds, @Value("${discovery.cache-max-entries:500}") int maxEntries) {
        this.coordinator = coordinator;
        this.ttlMillis = TimeUnit.MINUTES.toMillis(ttlMinutes);
        this.waitMillis = TimeUnit.SECONDS.toMillis(waitSeconds);
        this.maxEntries = maxEntries;
    }
    public ExposureReport getOrStart(String domain, boolean adminMode, Supplier<ExposureReport> loader) {
        String key = key(domain, adminMode);
        ExposureReport cached = getCached(key);
        if (cached != null) return cached;
        CompletableFuture<ExposureReport> created = new CompletableFuture<>();
        CompletableFuture<ExposureReport> existing = inFlight.putIfAbsent(key, created);
        CompletableFuture<ExposureReport> future = existing == null ? created : existing;
        if (existing == null) start(key, created, loader);
        try {
            return future.get(waitMillis, TimeUnit.MILLISECONDS);
        } catch (TimeoutException exception) {
            throw new ScanQueuedException();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Scan request was interrupted.", exception);
        } catch (Exception exception) {
            throw unwrap(exception);
        }
    }
    public Optional<ExposureReport> get(String domain, boolean adminMode) {
        return Optional.ofNullable(getCached(key(domain, adminMode)));
    }
    private void start(String key, CompletableFuture<ExposureReport> target, Supplier<ExposureReport> loader) {
        CompletableFuture.supplyAsync(loader, coordinator).whenComplete((report, error) -> {
            if (error == null && report != null) {
                put(key, report);
                target.complete(report);
            } else {
                target.completeExceptionally(error == null ? new IllegalStateException("Scan failed.") : error);
            }
            inFlight.remove(key, target);
        });
    }
    private ExposureReport getCached(String key) {
        CachedReport entry = completed.get(key);
        if (entry == null) return null;
        if (entry.expiresAtMillis <= System.currentTimeMillis()) {
            completed.remove(key, entry);
            return null;
        }
        return entry.report;
    }
    private void put(String key, ExposureReport report) {
        completed.entrySet().removeIf(entry -> entry.getValue().expiresAtMillis <= System.currentTimeMillis());
        if (completed.size() >= maxEntries && !completed.containsKey(key)) {
            Iterator<String> keys = completed.keySet().iterator();
            if (keys.hasNext()) completed.remove(keys.next());
        }
        completed.put(key, new CachedReport(report, System.currentTimeMillis() + ttlMillis));
    }
    private String key(String domain, boolean adminMode) {
        return (adminMode ? "admin:" : "user:") + domain.trim().toLowerCase();
    }
    private RuntimeException unwrap(Exception exception) {
        Throwable cause = exception.getCause();
        if (cause instanceof CompletionException completion && completion.getCause() != null) cause = completion.getCause();
        if (cause instanceof RuntimeException runtime) return runtime;
        return new IllegalStateException("Scan failed.", cause == null ? exception : cause);
    }
    private record CachedReport(ExposureReport report, long expiresAtMillis) { }
}