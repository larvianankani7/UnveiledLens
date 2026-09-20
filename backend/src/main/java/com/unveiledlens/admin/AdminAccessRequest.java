package com.unveiledlens.admin;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "admin_access_requests")
public class AdminAccessRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String email;
    @Column(nullable = false, unique = true)
    private String requestTokenHash;
    @Column(unique = true)
    private String adminIdHash;
    @Column(nullable = false)
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime adminIdExpiresAt;
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
