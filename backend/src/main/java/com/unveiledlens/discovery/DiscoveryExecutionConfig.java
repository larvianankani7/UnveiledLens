package com.unveiledlens.discovery;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
public class DiscoveryExecutionConfig {
    @Bean("discoveryCoordinatorExecutor")
    Executor discoveryCoordinatorExecutor(@Value("${discovery.background-concurrency:2}") int concurrency) {
        return executor("discovery-coordinator-", concurrency, concurrency);
    }

    @Bean("discoveryIoExecutor")
    Executor discoveryIoExecutor(@Value("${discovery.io-concurrency:8}") int concurrency) {
        return executor("discovery-io-", concurrency, concurrency * 16);
    }

    private Executor executor(String prefix, int corePoolSize, int queueCapacity) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setThreadNamePrefix(prefix);
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(corePoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        executor.initialize();
        return executor;
    }
}
