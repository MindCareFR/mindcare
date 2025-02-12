package com.mindcare.api.model;

import com.mindcare.api.utils.LanguagesConverter;

import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import java.util.Set;
import java.util.HashSet;
import java.util.List;

@Entity
@Table(name = "user_professional")
@Data
@EqualsAndHashCode(callSuper = true)
public class UserProfessional extends User {

  @Column(nullable = false)
  @Convert(converter = LanguagesConverter.class)
  private List<String> languages;

  @Column(nullable = false)
  private Integer experience;

  @Column(nullable = false)
  private String certification;

  @Column(nullable = false)
  private String companyName;

  @Column(nullable = false, unique = true)
  private String medicalIdentificationNumber;

  @Column(nullable = false, unique = true)
  private String companyIdentificationNumber;

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(
    name = "professional_therapy_domain",
    joinColumns = @JoinColumn(name = "professional_uuid"),
    inverseJoinColumns = @JoinColumn(name = "therapy_domain_id")
  )
  private Set<TherapyDomain> therapyDomains = new HashSet<>();
}
