package com.mindcare.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class GovernmentApiService {
    
    @Value("${api.company.url}")
    private String companyApiUrl; // API SIRENE pour SIRET
    
    @Value("${api.medical.url}")
    private String medicalApiUrl; // API ADELI/RPPS
    
    private final RestTemplate restTemplate;

    public GovernmentApiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public boolean verifyCompanyId(String companyId) {
        try {
            String url = companyApiUrl + "/siret/" + companyId;
            ApiResponse response = restTemplate.getForObject(url, ApiResponse.class);
            log.info("Company ID verification attempt: {}", companyId);
            return response != null && response.isValid();
        } catch (Exception e) {
            log.error("Error verifying Company ID: {}", companyId, e);
            return false;
        }
    }

    public boolean verifyMedicalId(String medicalId) {
        try {
            String url = medicalApiUrl + "/verify/" + medicalId;
            ApiResponse response = restTemplate.getForObject(url, ApiResponse.class);
            log.info("Medical ID verification attempt: {}", medicalId);
            return response != null && response.isValid();
        } catch (Exception e) {
            log.error("Error verifying Medical ID: {}", medicalId, e);
            return false;
        }
    }

    private static class ApiResponse {
        private boolean valid;
        public boolean isValid() {
            return valid;
        }
    }
}