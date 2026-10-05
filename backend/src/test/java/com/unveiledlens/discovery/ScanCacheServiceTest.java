package com.unveiledlens.discovery;
import com.unveiledlens.discovery.dto.ExposureReport;
import org.junit.jupiter.api.Test;
import java.util.concurrent.Executor;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;

class ScanCacheServiceTest {
    private final Executor directExecutor = Runnable::run;
    @Test
    void reusesACompletedScanForTheSameDomainAndMode() {
        ScanCacheService cache = new ScanCacheService(directExecutor, 15, 60, 10);
        AtomicInteger executions = new AtomicInteger();
        ExposureReport first = cache.getOrStart("example.com", false, () -> report(executions.incrementAndGet()));
        ExposureReport second = cache.getOrStart("example.com", false, () -> report(executions.incrementAndGet()));
        assertEquals(1, executions.get());
        assertSame(first, second);
    }
    @Test
    void separatesUserAndAdminReports() {
        ScanCacheService cache = new ScanCacheService(directExecutor, 15, 60, 10);
        AtomicInteger executions = new AtomicInteger();
        cache.getOrStart("example.com", false, () -> report(executions.incrementAndGet()));
        cache.getOrStart("example.com", true, () -> report(executions.incrementAndGet()));
        assertEquals(2, executions.get());
    }
    private ExposureReport report(int marker) {
        return ExposureReport.builder().domain("example-" + marker + ".com").build();
    }
}
