package com.mindcare.api.exception;

public class DuplicateEmailException extends RuntimeException {
  public DuplicateEmailException(String message) {
      super(message);
  }
}