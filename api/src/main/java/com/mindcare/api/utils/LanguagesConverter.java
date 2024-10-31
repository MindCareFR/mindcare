package com.mindcare.api.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.List;

@Converter
public class LanguagesConverter implements AttributeConverter<List<String>, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<String> languages) {
        try {
            return objectMapper.writeValueAsString(languages);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting list of languages to JSON", e);
        }
    }

    @Override
    public List<String> convertToEntityAttribute(String languagesJson) {
        try {
            return objectMapper.readValue(languagesJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            throw new IllegalArgumentException("Error converting JSON to list of languages", e);
        }
    }
}