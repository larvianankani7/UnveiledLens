package com.unveiledlens.admin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminAccessRequestRepository
        extends JpaRepository<AdminAccessRequest, Long> {

    Optional<AdminAccessRequest> findByRequestTokenHash(
            String requestTokenHash
    );

    Optional<AdminAccessRequest> findByAdminIdHash(
            String adminIdHash
    );

    Optional<AdminAccessRequest>
    findTopByEmailOrderByCreatedAtDesc(
            String email
    );

    Optional<AdminAccessRequest>
    findTopByEmailAndStatusOrderByCreatedAtDesc(
            String email,
            String status
    );
}