package com.mindcare.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserRegistrationDTO {
  private String email;
  private String firstName;
  private String lastName;
}