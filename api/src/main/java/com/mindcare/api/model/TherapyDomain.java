package com.mindcare.api.model;

import lombok.Data;
import jakarta.persistence.*;
import java.util.Set;
import java.util.HashSet;
import java.lang.Integer;
import java.time.LocalDateTime;

@Entity
@Table(name = "therapy_domain")
@Data
public class TherapyDomain {
  
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = true)
  private String description;

  @Column(nullable = false)
  private Boolean isActive = true;

  @Column(nullable = false)
  private LocalDateTime createdAt = LocalDateTime.now();

  @Column(nullable = true)
  private LocalDateTime updatedAt;

  @ManyToMany(mappedBy = "therapyDomains", fetch = FetchType.EAGER)
  private Set<UserProfessional> professionals = new HashSet<>();
}
