package com.mindcare.api.dto.auth;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RegisterPatientDTO extends RegisterDTO {
  @NotBlank(message = "gender is required")
  private String gender;

  @NotNull(message = "isAnonymous is required")
  private Boolean isAnonymous = false;
}