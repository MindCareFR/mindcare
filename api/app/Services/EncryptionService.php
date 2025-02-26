<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use RuntimeException;

class EncryptionService
{
    private string $method = 'aes-256-cbc';
    private string $key;

    public function __construct()
    {
        $this->key = config('app.encryption_key');
        if (empty($this->key)) {
            throw new RuntimeException('Encryption key not found in configuration');
        }
    }

    public function encryptData(?string $data): ?string
    {
        if ($data === null) {
            return null;
        }

        try {
            $ivLength = openssl_cipher_iv_length($this->method);
            $iv = openssl_random_pseudo_bytes($ivLength);
            
            $encrypted = openssl_encrypt(
                $data,
                $this->method,
                $this->key,
                OPENSSL_RAW_DATA,
                $iv
            );

            if ($encrypted === false) {
                throw new RuntimeException('Encryption failed');
            }

            // Combine IV and encrypted data with a delimiter
            return base64_encode($iv . $encrypted);
        } catch (\Exception $e) {
            Log::error('Error encrypting data', ['error' => $e->getMessage()]);
            throw new RuntimeException('Error encrypting data', 0, $e);
        }
    }

    public function decryptData(?string $encryptedData): ?string
    {
        if ($encryptedData === null) {
            return null;
        }

        try {
            $ivLength = openssl_cipher_iv_length($this->method);
            $data = base64_decode($encryptedData);
            
            // Extract IV and encrypted data
            $iv = substr($data, 0, $ivLength);
            $encrypted = substr($data, $ivLength);

            $decrypted = openssl_decrypt(
                $encrypted,
                $this->method,
                $this->key,
                OPENSSL_RAW_DATA,
                $iv
            );

            if ($decrypted === false) {
                throw new RuntimeException('Decryption failed');
            }

            return $decrypted;
        } catch (\Exception $e) {
            Log::error('Error decrypting data', ['error' => $e->getMessage()]);
            throw new RuntimeException('Error decrypting data', 0, $e);
        }
    }

    public function isEncrypted(?string $data): bool
    {
        if ($data === null) {
            return false;
        }

        try {
            $decoded = base64_decode($data, true);
            return $decoded !== false;
        } catch (\Exception $e) {
            return false;
        }
    }
}