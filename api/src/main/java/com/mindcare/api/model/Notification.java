package com.mindcare.api.model;

import lombok.Builder;
import lombok.Data;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
public class Notification {
  
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(nullable = false)
  private String userType;

  @Column(nullable = false)
  private String value;

  @Column(name = "created_at", nullable = false)
  @Builder.Default
  private LocalDateTime createdAt = LocalDateTime.now();

  @Column(nullable = true)
  private LocalDateTime deletedAt;

  @ManyToOne
  @JoinColumn(name = "user_uuid", referencedColumnName = "uuid")
  private User user;
}
