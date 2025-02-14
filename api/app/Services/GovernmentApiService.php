<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class GovernmentApiService
{
  private string $companyApiUrl;
  private string $medicalApiUrl;

  public function __construct()
  {
    $this->companyApiUrl = config('services.government.company_api_url');
    $this->medicalApiUrl = config('services.government.medical_api_url');
  }

  public function verifyCompanyId(string $companyId): bool
  {
    try {
      $url = $this->companyApiUrl . '/siret/' . $companyId;
      $response = Http::get($url)->json();

      Log::info('Company ID verification attempt', ['companyId' => $companyId]);

      return isset($response['valid']) && $response['valid'] === true;
    } catch (\Exception $e) {
      Log::error('Error verifying Company ID', [
        'companyId' => $companyId,
        'error' => $e->getMessage()
      ]);
      return false;
    }
  }

  public function verifyMedicalId(string $medicalId): bool
  {
    try {
      $url = $this->medicalApiUrl . '/verify/' . $medicalId;
      $response = Http::get($url)->json();

      Log::info('Medical ID verification attempt', ['medicalId' => $medicalId]);

      return isset($response['valid']) && $response['valid'] === true;
    } catch (\Exception $e) {
      Log::error('Error verifying Medical ID', [
        'medicalId' => $medicalId,
        'error' => $e->getMessage()
      ]);
      return false;
    }
  }
}
