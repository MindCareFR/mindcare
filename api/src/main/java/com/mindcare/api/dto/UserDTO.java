package com.mindcare.api.dto;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
  private String firstname;
  private String lastname;
  private String email;
  private String password;
  private String phone;
  private LocalDate birthdate;
  private String address;
  private String addressComplement;
  private String zipcode;
  private String city;
  private String country;
}