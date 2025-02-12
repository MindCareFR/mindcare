package com.mindcare.api.model.enums;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public enum BusinessAction {
  PAYMENT,
  REFUSED_PAYMENT,
  INVOICE,
  MEDICAL_FILE_UPDATE,
  VIDEO_CONSULTATION
}