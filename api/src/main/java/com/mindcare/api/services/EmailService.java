package com.mindcare.api.services;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.mindcare.api.dto.UserRegistrationDTO;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    
    private static final String COMPANY_LOGO_URL = "http://localhost:4200/assets/logo.png";
    private static final int TOKEN_VALIDITY_HOURS = 24;

    public void sendRegistrationEmail(UserRegistrationDTO user, String token) throws MessagingException {
        Context context = new Context();
        context.setVariable("firstName", user.getFirstName());
        context.setVariable("lastName", user.getLastName());
        context.setVariable("logoUrl", COMPANY_LOGO_URL);
        context.setVariable("validationUrl", "http://localhost:4200/auth/validate?token=" + token);
        context.setVariable("expirationDate", LocalDateTime.now().plusHours(TOKEN_VALIDITY_HOURS)
            .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

        String htmlContent = templateEngine.process("user_registration", context);
        sendHtmlEmail(user.getEmail(), "Bienvenue sur MindCare", htmlContent);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
        
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        
        mailSender.send(message);
    }
}