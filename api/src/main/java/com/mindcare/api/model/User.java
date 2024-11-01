package com.mindcare.api.model;

import lombok.Data;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import java.util.UUID;
import java.util.Set;
import java.util.HashSet;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "\"user\"")
@Data
public class User {
  
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID uuid;

  @Column(nullable = false)
  private String firstname;

  @Column(nullable = false)
  private String lastname;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false)
  private String password;

  @Column(nullable = false)
  private LocalDate birthdate;

  @Column(nullable = false)
  private String phone;

  @Column(nullable = false)
  private String token;

  @Column(nullable = false)
  private String address;

  @Column(nullable = true)
  private String addressComplement;

  @Column(nullable = false)
  private String zipcode;

  @Column(nullable = false)
  private String city;

  @Column(nullable = false)
  private String country;

  @OneToMany(mappedBy = "user")
  private Set<Notification> notifications = new HashSet<>();

  @ManyToOne
  @JoinColumn(name = "role_id")
  private Role role;

  @Column(nullable = false)
  private LocalDateTime createdAt = LocalDateTime.now();

  @Column(nullable = true)
  private LocalDateTime updatedAt;

  @Column(nullable = true)
  private LocalDateTime deletedAt;
}
