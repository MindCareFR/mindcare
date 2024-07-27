package com.mindcare.api.model;

import lombok.Data;
import jakarta.persistence.*;
import java.lang.Integer;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "user_role")
@Data
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    @OneToMany(mappedBy = "role")
    private Set<UserPatient> users = new HashSet<>();

    @OneToMany(mappedBy = "role")
    private Set<UserProfessional> professionals = new HashSet<>();
}
