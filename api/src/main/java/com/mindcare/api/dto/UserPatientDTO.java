package com.mindcare.api.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class UserPatientDTO extends UserDTO {
  private String gender;
  private Boolean isAnonymous;
}