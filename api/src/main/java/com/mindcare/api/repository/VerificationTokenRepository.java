package com.mindcare.api.repository;

import com.mindcare.api.model.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
  Optional<VerificationToken> findByToken(String token);
  void deleteByToken(String token);
  void deleteAllByExpiryDateBefore(LocalDateTime now);
}