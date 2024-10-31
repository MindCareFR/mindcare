package com.mindcare.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

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