package com.mindcare.api.config;

import com.mindcare.api.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Configuration
@EnableScheduling
@RequiredArgsConstructor
public class ScheduledTasks {

  private final VerificationTokenRepository tokenRepository;

  @Scheduled(cron = "0 0 0 * * ?") // Tous les jours à minuit
  @Transactional
  public void cleanExpiredTokens() {
    LocalDateTime now = LocalDateTime.now();
    tokenRepository.deleteAllByExpiryDateBefore(now);
  }
}