package com.mindcare.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

import com.mindcare.api.model.enums.BusinessAction;
import com.mindcare.api.model.enums.Status;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "business_logs")
public class BusinessLogs {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "action_type", nullable = false)
  @Enumerated(EnumType.STRING)
  private BusinessAction actionType;

  @Column(nullable = false)
  private String description;

  @Column(name = "meta_data", columnDefinition = "json")
  private String metaData;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private Status status;

  @Column(name = "created_at", nullable = false)
  @Builder.Default
  private LocalDateTime createdAt = LocalDateTime.now();
}