package com.unveiledlens.audit;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String eventType;
    private String details;
    private Long userId;
    private LocalDateTime timestamp = LocalDateTime.now();
}

