package com.mindcare.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Entity
@NoArgsConstructor
@Table(name = "verification_tokens")
public class VerificationToken {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private String token;

  @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
  @JoinColumn(nullable = false, name = "user_id")
  private User user;

  @Column(name = "expiry_date", nullable = false)
  private LocalDateTime expiryDate;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt = LocalDateTime.now();
}