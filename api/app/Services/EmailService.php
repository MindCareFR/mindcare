<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Mail\Message;
use Carbon\Carbon;

class EmailService
{
  private const COMPANY_LOGO_URL = 'http://localhost:4200/assets/logo.png';
  private const TOKEN_VALIDITY_HOURS = 24;

  public function sendRegistrationEmail(array $user, string $token): void
{
    try {
        $expirationDate = Carbon::now()->addHours(self::TOKEN_VALIDITY_HOURS)->format('d/m/Y H:i');

        Log::info('Sending registration email', [
            'user_email' => $user['email'],
            'token' => $token,
            'validation_url' => "http://localhost:8000/api/auth/verify?token=". $token
        ]);

        Mail::send('emails.user_registration', [
            'firstName' => $user['firstname'],
            'lastName' => $user['lastname'],
            'logoUrl' => self::COMPANY_LOGO_URL,
          'validationUrl' => "http://localhost:8000/api/auth/verify?token=" . $token,
            'expirationDate' => $expirationDate
        ], function (Message $message) use ($user) {
            $message->to($user['email'])
                ->subject('Bienvenue sur MindCare - Vérification de votre email');
        });

        Log::info('Registration email sent successfully', [
            'user_email' => $user['email']
        ]);
    } catch (\Exception $e) {
        Log::error('Failed to send registration email', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'user' => $user['email']
        ]);
        throw $e;
    }
}
}
