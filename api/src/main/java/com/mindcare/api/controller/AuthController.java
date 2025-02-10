package com.mindcare.api.controller;

import com.mindcare.api.dto.auth.*;
import com.mindcare.api.service.AuthService;
import com.mindcare.api.service.EmailService;
import com.mindcare.api.dto.UserRegistrationDTO;
import com.mindcare.api.exception.DuplicateEmailException;
import com.mindcare.api.exception.TokenExpiredException;
import com.mindcare.api.exception.TokenNotFoundException;
import com.mindcare.api.model.User;
import com.mindcare.api.model.VerificationToken;
import com.mindcare.api.repository.UserRepository;
import com.mindcare.api.repository.VerificationTokenRepository;
import com.mindcare.api.security.JwtAuthenticationResponse;
import com.mindcare.api.security.JwtTokenProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;
import java.time.LocalDateTime;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final VerificationTokenRepository tokenRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/register/patient")
    public ResponseEntity<?> registerPatient(@Valid @RequestBody RegisterPatientDTO registerDto) {
        log.info("Registration attempt for patient with email: {}", registerDto.getEmail());
        
        // Vérification de l'email unique
        if (userRepository.existsByEmail(registerDto.getEmail())) {
            log.warn("Registration failed: Email already exists - {}", registerDto.getEmail());
            throw new DuplicateEmailException("Email already exists");
        }

        // Création de l'utilisateur
        User user = authService.registerPatient(registerDto);
        
        // Génération du token de vérification
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        tokenRepository.save(verificationToken);

        // Envoi de l'email de confirmation
        try {
            UserRegistrationDTO userRegDto = new UserRegistrationDTO(
                user.getEmail(),
                user.getFirstname(),
                user.getLastname()
            );
            emailService.sendRegistrationEmail(userRegDto, token);
        } catch (Exception e) {
            log.error("Failed to send verification email", e);
            // On continue le processus même si l'email échoue
        }

        log.info("Patient registered successfully: {}", user.getEmail());
        return ResponseEntity.ok().body("Registration successful. Please check your email for verification.");
    }

    @PostMapping("/register/pro")
    public ResponseEntity<?> registerPro(@Valid @RequestBody RegisterProDTO registerDto) {
        log.info("Registration attempt for professional with email: {}", registerDto.getEmail());
        
        if (userRepository.existsByEmail(registerDto.getEmail())) {
            log.warn("Registration failed: Email already exists - {}", registerDto.getEmail());
            throw new DuplicateEmailException("Email already exists");
        }

        User user = authService.registerPro(registerDto);
        
        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiryDate(LocalDateTime.now().plusHours(24));
        tokenRepository.save(verificationToken);

        try {
            UserRegistrationDTO userRegDto = new UserRegistrationDTO(
                user.getEmail(),
                user.getFirstname(),
                user.getLastname()
            );
            emailService.sendRegistrationEmail(userRegDto, token);
        } catch (Exception e) {
            log.error("Failed to send verification email", e);
        }

        log.info("Professional registered successfully: {}", user.getEmail());
        return ResponseEntity.ok().body("Registration successful. Please check your email for verification.");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDTO loginDto) {
        log.info("Login attempt for user: {}", loginDto.getEmail());
        
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
        );

        String jwt = tokenProvider.generateToken(authentication);
        
        log.info("User logged in successfully: {}", loginDto.getEmail());
        return ResponseEntity.ok().body(new JwtAuthenticationResponse(jwt));
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyEmail(@RequestParam("token") String token) {
        log.info("Email verification attempt with token: {}", token);
        
        VerificationToken verificationToken = tokenRepository.findByToken(token)
            .orElseThrow(() -> new TokenNotFoundException("Invalid verification token"));

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            log.warn("Token expired: {}", token);
            throw new TokenExpiredException("Token has expired");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        tokenRepository.delete(verificationToken);

        log.info("Email verified successfully for user: {}", user.getEmail());
        return ResponseEntity.ok().body("Email verified successfully");
    }
}