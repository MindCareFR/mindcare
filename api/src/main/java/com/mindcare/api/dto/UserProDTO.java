package com.mindcare.api.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
public class UserProDTO extends UserDTO {
  private String languages;
  private Integer experience;
  private String certification;
  private String company;
  private String medicalIdentificationNumber;
}