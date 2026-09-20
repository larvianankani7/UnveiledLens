CREATE TABLE admin_access_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    request_token_hash VARCHAR(255) NOT NULL UNIQUE,
    admin_id_hash VARCHAR(255) UNIQUE,
    status VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    rejected_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    admin_id_expires_at TIMESTAMP NULL
);

CREATE INDEX idx_admin_access_requests_email
    ON admin_access_requests(email);

CREATE INDEX idx_admin_access_requests_status
    ON admin_access_requests(status);