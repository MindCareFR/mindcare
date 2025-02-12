package com.mindcare.api.dto.auth;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterDTO {
  @NotBlank(message = "firstname is required")
  private String firstname;

  @NotBlank(message = "lastname is required")
  private String lastname;

  @Email(message = "must be valid email")
  @NotBlank(message = "email is required")
  private String email;

  @NotBlank(message = "password is required")
  @Size(min = 8, message = "password must be 8 characters minimum")
  private String password;

  @NotBlank(message = "phonenumber is required")
  private String phone;

  @NotNull(message = "birthdate is required")
  @Past(message = "birthdate cannot be in the past")
  private LocalDate birthdate;

  @NotBlank(message = "address is required")
  private String address;

  private String addressComplement;

  @NotBlank(message = "zipcode is required")
  private String zipcode;

  @NotBlank(message = "city is required")
  private String city;

  @NotBlank(message = "country is required")
  private String country;
}