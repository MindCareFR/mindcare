package com.mindcare.api.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.mindcare.api.dto.UserDTO;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPatientDTO extends UserDTO {
    private String gender;
    private Boolean isAnonymous;
}