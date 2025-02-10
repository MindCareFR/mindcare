package com.mindcare.api.service;

import com.mindcare.api.dto.auth.RegisterPatientDTO;
import com.mindcare.api.dto.auth.RegisterProDTO;
import com.mindcare.api.dto.auth.RegisterDTO;
import com.mindcare.api.model.User;
import com.mindcare.api.model.UserPatient;
import com.mindcare.api.model.UserProfessional;
import com.mindcare.api.model.Role;
import com.mindcare.api.repository.RoleRepository;
import com.mindcare.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final UserRepository userRepository;
  private final RoleRepository roleRepository;
  private final PasswordEncoder passwordEncoder;

  @Transactional
  public User registerPatient(RegisterPatientDTO registerDto) {
    UserPatient user = new UserPatient();
    mapCommonFields(user, registerDto);

    Optional<Role> role = roleRepository.findByName("ROLE_PATIENT");

    user.setGender(registerDto.getGender());
    user.setIsAnonymous(registerDto.getIsAnonymous());
    user.setRole(role.get());

    return userRepository.save(user);
  }

  @Transactional
  public User registerPro(RegisterProDTO registerDto) {
    UserProfessional user = new UserProfessional();
    mapCommonFields(user, registerDto);

    Optional<Role> role = roleRepository.findByName("ROLE_PRO");

    user.setLanguages(registerDto.getLanguages());
    user.setExperience(registerDto.getExperience());
    user.setCertification(registerDto.getCertification());
    user.setCompanyName(registerDto.getCompanyName());
    user.setMedicalIdentificationNumber(registerDto.getMedicalIdentificationNumber());
    user.setCompanyIdentificationNumber(registerDto.getCompanyIdentificationNumber());
    user.setRole(role.get());

    return userRepository.save(user);
  }

  private void mapCommonFields(User user, RegisterDTO registerDto) {
    user.setFirstname(registerDto.getFirstname());
    user.setLastname(registerDto.getLastname());
    user.setEmail(registerDto.getEmail());
    user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
    user.setPhone(registerDto.getPhone());
    user.setBirthdate(registerDto.getBirthdate());
    user.setAddress(registerDto.getAddress());
    user.setAddressComplement(registerDto.getAddressComplement());
    user.setZipcode(registerDto.getZipcode());
    user.setCity(registerDto.getCity());
    user.setCountry(registerDto.getCountry());
    user.setEmailVerified(false);
  }
}