package com.mindcare.api.model;

import lombok.Data;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "user_professional")
@Data
public class UserProfessional extends User {

  @Column(nullable = false)
  private String medicalIdentificationNumber;

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(
    name = "professional_therapy_domain",
    joinColumns = @JoinColumn(name = "professional_uuid"),
    inverseJoinColumns = @JoinColumn(name = "therapy_domain_id")
  )
  private Set<TherapyDomain> therapyDomains = new HashSet<>();
}
