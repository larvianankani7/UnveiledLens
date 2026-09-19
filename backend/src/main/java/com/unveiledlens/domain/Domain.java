package com.unveiledlens.domain;
import com.unveiledlens.user.User;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "domains")
public class Domain {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String domainName;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    private boolean verified;
    private String status;
    private LocalDateTime createdAt = LocalDateTime.now();
}

