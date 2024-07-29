package com.mindcare.api.model;

import lombok.Data;
import lombok.EqualsAndHashCode;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import java.time.LocalDate;

@Entity
@Table(name = "user_patient")
@Data
@EqualsAndHashCode(callSuper = true)
public class UserPatient extends User {

  @Column(nullable = false)
  private String gender;

  @Column(nullable = false)
  private LocalDate birthDate;

  @Column(nullable = false)
  private Boolean isAnonymous = false;
}
