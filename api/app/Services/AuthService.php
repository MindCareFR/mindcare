<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserPatient;
use App\Models\UserProfessional;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthService
{
  public function __construct(
    private EncryptionService $encryptionService
  ) {}

  public function registerPatient(array $data): User
    {
        return DB::transaction(function () use ($data) {
            // Créer l'utilisateur principal
            $user = new User();
            $this->mapCommonFields($user, $data);
            
            $role = Role::where('name', 'ROLE_PATIENT')->first();
            $user->role_id = $role->id;
            $user->save();

            // Créer les données spécifiques au patient avec le même UUID
            UserPatient::create([
                'uuid' => $user->uuid,  // Utilise le même UUID
                'gender' => $this->encryptionService->encryptData($data['gender']),
                'is_anonymous' => $data['is_anonymous'] ?? false,
            ]);

            return $user->load('role');
        });
    }

  public function registerPro(array $data): User
  {
    return DB::transaction(function () use ($data) {
      $user = new UserProfessional();
      $this->mapCommonFields($user, $data);

      $role = Role::where('name', 'ROLE_PRO')->first();

      // Encrypt sensitive professional data
      $user->languages = $data['languages'];
      $user->experience = $data['experience'];
      $user->certification = $this->encryptionService->encryptData($data['certification']);
      $user->company_name = $this->encryptionService->encryptData($data['company_name']);
      $user->medical_identification_number = $this->encryptionService->encryptData($data['medical_identification_number']);
      $user->company_identification_number = $this->encryptionService->encryptData($data['company_identification_number']);
      $user->role_id = $role->id;

      $user->save();
      return $user;
    });
  }

  private function mapCommonFields(User $user, array $data): void
  {
    // Non-sensitive data
    $user->firstname = $data['firstname'];
    $user->lastname = $data['lastname'];
    $user->email = $data['email'];
    $user->city = $data['city'];
    $user->country = $data['country'];
    $user->email_verified = false;

    // Sensitive data
    $user->password = Hash::make($data['password']);
    $user->phone = $this->encryptionService->encryptData($data['phone']);
    $user->birthdate = $data['birthdate'];
    $user->address = $this->encryptionService->encryptData($data['address']);
    $user->address_complement = isset($data['address_complement']) ?
      $this->encryptionService->encryptData($data['address_complement']) : null;
    $user->zipcode = $this->encryptionService->encryptData($data['zipcode']);
  }
}
