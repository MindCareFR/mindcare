package com.mindcare.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EncryptionService {

    @Value("${encryption.secret}")
    private String encryptionKey;

    private static final String ALGORITHM = "AES";

    // Pour les données sensibles qui doivent être récupérables (comme les numéros de téléphone)
    public String encryptData(String data) {
        try {
            String salt = BCrypt.gensalt();
            SecretKeySpec key = new SecretKeySpec(
                (encryptionKey + salt).getBytes(), 
                ALGORITHM
            );
            
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            
            byte[] encryptedBytes = cipher.doFinal(data.getBytes());
            String encryptedData = Base64.getEncoder().encodeToString(encryptedBytes);
            
            // On stocke le salt avec les données encryptées
            return encryptedData + ":" + salt;
        } catch (Exception e) {
            log.error("Error encrypting data", e);
            throw new RuntimeException("Error encrypting data", e);
        }
    }

    public String decryptData(String encryptedDataWithSalt) {
        try {
            // Séparation des données encryptées et du salt
            String[] parts = encryptedDataWithSalt.split(":");
            String encryptedData = parts[0];
            String salt = parts[1];
            
            SecretKeySpec key = new SecretKeySpec(
                (encryptionKey + salt).getBytes(), 
                ALGORITHM
            );
            
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key);
            
            byte[] decryptedBytes = cipher.doFinal(
                Base64.getDecoder().decode(encryptedData)
            );
            
            return new String(decryptedBytes);
        } catch (Exception e) {
            log.error("Error decrypting data", e);
            throw new RuntimeException("Error decrypting data", e);
        }
    }

    // Pour les données sensibles qui n'ont pas besoin d'être récupérées (comme les mots de passe)
    public String hashData(String data) {
        String salt = BCrypt.gensalt();
        return BCrypt.hashpw(data, salt);
    }

    public boolean verifyHash(String data, String hashedData) {
        try {
            return BCrypt.checkpw(data, hashedData);
        } catch (Exception e) {
            log.error("Error verifying hash", e);
            return false;
        }
    }

    // Méthode utilitaire pour vérifier si une chaîne est déjà encryptée
    public boolean isEncrypted(String data) {
        try {
            String[] parts = data.split(":");
            return parts.length == 2 && 
                   Base64.getDecoder().decode(parts[0]).length > 0;
        } catch (Exception e) {
            return false;
        }
    }
}