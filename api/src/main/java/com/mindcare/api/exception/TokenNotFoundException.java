package com.mindcare.api.exception;

public class TokenNotFoundException extends RuntimeException {
  public TokenNotFoundException(String message) {
      super(message);
  }
}