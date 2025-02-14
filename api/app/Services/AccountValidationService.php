<?php

namespace App\Services;

use Carbon\Carbon;

class AccountValidationService
{
  private const EMAIL_PATTERN = '/^[A-Za-z0-9+_.-]+@(.+)$/';
  private const PHONE_PATTERN = '/^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/';
  private const POSTAL_CODE_PATTERN = '/^(\d{5})$/';
  private const MEDICAL_ID_PATTERN = '/^\d{9}$/';  // ADELI pattern
  private const COMPANY_ID_PATTERN = '/^\d{14}$/'; // SIRET pattern

  public function isValidEmail(string $email): bool
  {
    return !empty($email) && preg_match(self::EMAIL_PATTERN, $email) === 1;
  }

  public function isValidPhone(string $phone): bool
  {
    return !empty($phone) && preg_match(self::PHONE_PATTERN, $phone) === 1;
  }

  public function isValidPostalCode(string $postalCode): bool
  {
    return !empty($postalCode) && preg_match(self::POSTAL_CODE_PATTERN, $postalCode) === 1;
  }

  public function isValidBirthdate(string $birthdate): bool
  {
    try {
      $date = Carbon::parse($birthdate);
      $minDate = Carbon::now()->subYears(100);
      $maxDate = Carbon::now()->subYears(18);

      return $date->isAfter($minDate) && $date->isBefore($maxDate);
    } catch (\Exception $e) {
      return false;
    }
  }

  public function isValidMedicalId(string $medicalId): bool
  {
    return !empty($medicalId) && preg_match(self::MEDICAL_ID_PATTERN, $medicalId) === 1;
  }

  public function isValidCompanyId(string $companyId): bool
  {
    return !empty($companyId) &&
      preg_match(self::COMPANY_ID_PATTERN, $companyId) === 1 &&
      $this->validateLuhn($companyId);
  }

  private function validateLuhn(string $number): bool
  {
    $sum = 0;
    $alternate = false;

    for ($i = strlen($number) - 1; $i >= 0; $i--) {
      $digit = (int) $number[$i];

      if ($alternate) {
        $digit *= 2;
        if ($digit > 9) {
          $digit -= 9;
        }
      }

      $sum += $digit;
      $alternate = !$alternate;
    }

    return $sum % 10 === 0;
  }
}
