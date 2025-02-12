package com.mindcare.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserRegistrationDTO {
  private String email;
  private String firstName;
  private String lastName;

  public UserRegistrationDTO(String email, String firstname, String lastname) {
    this.email = email;
    this.firstName = firstname;
    this.lastName = lastname;
  }
}