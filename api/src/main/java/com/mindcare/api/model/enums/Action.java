package com.mindcare.api.model.enums;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public enum Action {
    CREATE("Create"),
    UPDATE("Update"),
    DELETE("Delete"),
    LOGIN("Login"),
    LOGOUT("Logout");

    private final String value;

    public String getValue() {
        return value;
    }
}