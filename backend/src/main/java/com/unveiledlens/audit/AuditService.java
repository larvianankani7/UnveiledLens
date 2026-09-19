package com.unveiledlens.audit;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditRepository auditRepository;
    
    public void log(String eventType, String details, Long userId) {
        AuditLog log = new AuditLog();
        log.setEventType(eventType);
        log.setDetails(details);
        log.setUserId(userId);
        auditRepository.save(log);
    }
}

