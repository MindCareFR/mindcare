package com.mindcare.api.dto.auth;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RegisterProDTO extends RegisterDTO {
  @NotNull(message = "languages list is required")
  @Size(min = 1, message = "at least one language is required")
  private List<String> languages;

  @NotNull(message = "experience is required")
  @Min(value = 0, message = "experience cannot be negative")
  private Integer experience;

  @NotBlank(message = "certification is required")
  private String certification;

  @NotBlank(message = "company name is required")
  private String companyName;

  @NotBlank(message = "medical identification number is required")
  private String medicalIdentificationNumber;

  @NotBlank(message = "company identification number is required")
  private String companyIdentificationNumber;

  @NotNull(message = "therapy domains are required")
  @Size(min = 1, message = "at least one therapy domain must be selected")
  private List<Integer> therapyDomainIds;
}