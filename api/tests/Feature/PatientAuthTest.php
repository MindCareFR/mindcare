<?php

namespace Tests\Feature\Auth;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Laravel\Sanctum\PersonalAccessToken;
use App\Services\EncryptionService;

class PatientAuthTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    private array $validPatientData;
    private EncryptionService $encryptionService;

    protected function setUp(): void
    {
        parent::setUp();
        Role::create(['name' => 'ROLE_PATIENT']);
        $this->encryptionService = app(EncryptionService::class);
        $this->validPatientData = [
            'email' => 'test@example.com',
            'password' => 'password123',
            'firstname' => 'John',
            'lastname' => 'Doe',
            'birthdate' => '1990-01-01',
            'phone' => '0612345678',
            'address' => '123 Test Street',
            'zipcode' => '75000',
            'city' => 'Paris',
            'country' => 'France',
            'gender' => 'Male',
            'is_anonymous' => false
        ];
    }

    private function createPatientAndGetVerificationToken(): array
    {
        $response = $this->postJson('/api/auth/register/patient', $this->validPatientData);
        
        $user = User::where('email', $this->validPatientData['email'])->first();
        $token = PersonalAccessToken::where('name', 'email-verify')
            ->where('tokenable_id', $user->uuid)
            ->first();

        return [
            'user' => $user,
            'token' => $token->plainTextToken
        ];
    }

    public function test_a_patient_can_register()
    {
        $response = $this->postJson('/api/auth/register/patient', $this->validPatientData);

        $response->assertStatus(200)
                ->assertJson(['message' => 'Registration successful. Please check your email for verification.']);

        $this->assertDatabaseHas('users', [
            'email' => $this->validPatientData['email'],
            'firstname' => $this->validPatientData['firstname'],
            'lastname' => $this->validPatientData['lastname'],
        ]);

        $user = User::where('email', $this->validPatientData['email'])->first();
        $this->assertDatabaseHas('user_patients', [
            'uuid' => $user->uuid,
            'is_anonymous' => $this->validPatientData['is_anonymous'],
        ]);

        $patient = \App\Models\UserPatient::where('uuid', $user->uuid)->first();
        $decryptedGender = $this->encryptionService->decryptData($patient->gender);
        $this->assertEquals($this->validPatientData['gender'], $decryptedGender);
    }

    public function test_a_patient_cannot_register_with_duplicate_email()
    {
        $this->postJson('/api/auth/register/patient', $this->validPatientData);
        $response = $this->postJson('/api/auth/register/patient', $this->validPatientData);
        
        $response->assertStatus(422)
                ->assertJsonValidationErrors(['email']);
    }

    public function test_a_patient_can_verify_email()
    {
        $this->postJson('/api/auth/register/patient', $this->validPatientData);
        
        $tokenModel = PersonalAccessToken::where('name', 'email-verify')->first();
        
        $randomToken = bin2hex(random_bytes(32));
        $tokenModel->update(['token' => hash('sha256', $randomToken)]);
        $response = $this->getJson('/api/auth/verify?token=1|' . $randomToken);
    
        $response->assertStatus(200)
                ->assertJson(['message' => 'Email verified successfully']);
    
        $this->assertDatabaseHas('users', [
            'email' => $this->validPatientData['email'],
            'email_verified' => true
        ]);
    }

    public function test_a_patient_cannot_login_with_unverified_email()
    {
        $this->postJson('/api/auth/register/patient', $this->validPatientData);

        $response = $this->postJson('/api/auth/login', [
            'email' => $this->validPatientData['email'],
            'password' => $this->validPatientData['password']
        ]);

        $response->assertStatus(403)
                ->assertJson(['error' => 'email_not_verified']);
    }

    public function test_a_patient_can_login_after_email_verification()
    {
        $this->postJson('/api/auth/register/patient', $this->validPatientData);
        
        $tokenModel = PersonalAccessToken::where('name', 'email-verify')->first();
        $randomToken = bin2hex(random_bytes(32));
        $tokenModel->update(['token' => hash('sha256', $randomToken)]);
        
        $this->getJson('/api/auth/verify?token=1|' . $randomToken);

        $response = $this->postJson('/api/auth/login', [
            'email' => $this->validPatientData['email'],
            'password' => $this->validPatientData['password']
        ]);

        $response->assertStatus(200)
                ->assertJsonStructure(['token']);
    }
}