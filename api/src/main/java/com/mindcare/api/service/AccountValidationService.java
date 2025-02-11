package com.mindcare.api.service;

import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.regex.Pattern;

@Service
public class AccountValidationService {
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^(?:(?:\\+|00)33|0)\\s*[1-9](?:[\\s.-]*\\d{2}){4}$");
    private static final Pattern POSTAL_CODE_PATTERN = Pattern.compile("^(\\d{5})$");
    private static final Pattern MEDICAL_ID_PATTERN = Pattern.compile("^\\d{9}$"); // ADELI pattern
    private static final Pattern COMPANY_ID_PATTERN = Pattern.compile("^\\d{14}$"); // SIRET pattern

    public boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    public boolean isValidPhone(String phone) {
        return phone != null && PHONE_PATTERN.matcher(phone).matches();
    }

    public boolean isValidPostalCode(String postalCode) {
        return postalCode != null && POSTAL_CODE_PATTERN.matcher(postalCode).matches();
    }

    public boolean isValidBirthdate(LocalDate birthdate) {
        if (birthdate == null) return false;
        LocalDate minDate = LocalDate.now().minusYears(100);
        LocalDate maxDate = LocalDate.now().minusYears(18);
        return birthdate.isAfter(minDate) && birthdate.isBefore(maxDate);
    }

    public boolean isValidMedicalId(String medicalId) {
        return medicalId != null && MEDICAL_ID_PATTERN.matcher(medicalId).matches();
    }

    public boolean isValidCompanyId(String companyId) {
        return companyId != null && COMPANY_ID_PATTERN.matcher(companyId).matches() 
            && validateLuhn(companyId); // Validation SIRET avec algorithme de Luhn
    }

    private boolean validateLuhn(String number) {
        int sum = 0;
        boolean alternate = false;
        for (int i = number.length() - 1; i >= 0; i--) {
            int digit = number.charAt(i) - '0';
            if (alternate) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            sum += digit;
            alternate = !alternate;
        }
        return sum % 10 == 0;
    }
}