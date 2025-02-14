<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

class EncryptionService
{
  private string $algorithm = 'AES-256-CBC';

  public function encryptData(string $data): string
  {
    try {
      $salt = Hash::make(random_bytes(16));
      $key = config('app.encryption_key') . $salt;

      $encryptedData = Crypt::encryptString($data);

      // Store salt with encrypted data
      return $encryptedData . ':' . $salt;
    } catch (\Exception $e) {
      Log::error('Error encrypting data', ['error' => $e->getMessage()]);
      throw new RuntimeException('Error encrypting data', 0, $e);
    }
  }

  public function decryptData(string $encryptedDataWithSalt): string
  {
    try {
      // Split encrypted data and salt
      $parts = explode(':', $encryptedDataWithSalt);
      if (count($parts) !== 2) {
        throw new RuntimeException('Invalid encrypted data format');
      }

      $encryptedData = $parts[0];

      return Crypt::decryptString($encryptedData);
    } catch (\Exception $e) {
      Log::error('Error decrypting data', ['error' => $e->getMessage()]);
      throw new RuntimeException('Error decrypting data', 0, $e);
    }
  }

  public function hashData(string $data): string
  {
    return Hash::make($data);
  }

  public function verifyHash(string $data, string $hashedData): bool
  {
    try {
      return Hash::check($data, $hashedData);
    } catch (\Exception $e) {
      Log::error('Error verifying hash', ['error' => $e->getMessage()]);
      return false;
    }
  }

  public function isEncrypted(string $data): bool
  {
    try {
      $parts = explode(':', $data);
      return count($parts) === 2 && !empty($parts[0]) && !empty($parts[1]);
    } catch (\Exception $e) {
      return false;
    }
  }
}
