package com.unveiledlens.user;
import com.unveiledlens.common.Role;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String email;
    private String phone;
    private String password;
    @Enumerated(EnumType.STRING)
    @org.hibernate.annotations.JdbcTypeCode(java.sql.Types.VARCHAR)
    private Role role;
    private LocalDateTime createdAt = LocalDateTime.now();
}

