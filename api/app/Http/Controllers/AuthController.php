<?php

namespace App\Http\Controllers;

use App\Services\AuthService;
use App\Services\EmailService;
use App\Services\GovernmentApiService;
use App\Services\AccountValidationService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use \Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService,
        private EmailService $emailService,
        private AccountValidationService $validationService,
        private GovernmentApiService $govApiService
    ) {}

    public function registerPatient(Request $request)
    {
        Log::info('Registration attempt for patient with email: ' . $request->email);

        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
            'firstname' => 'required|string',
            'lastname' => 'required|string',
            'birthdate' => 'required|date',
            'phone' => 'required|string',
            'address' => 'required|string',
            'address_complement' => 'nullable|string',
            'zipcode' => 'required|string',
            'city' => 'required|string',
            'country' => 'required|string',
            'gender' => 'required|string',
            'is_anonymous' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $this->authService->registerPatient($validator->validated());
        $token = $user->createToken('email-verify', ['*'], now()->addHours(24))->plainTextToken;

        try {
            $this->emailService->sendRegistrationEmail([
                'email' => $user->email,
                'firstname' => $user->firstname,
                'lastname' => $user->lastname
            ], $token);
        } catch (\Exception $e) {
            Log::error('Failed to send verification email', ['error' => $e->getMessage()]);
        }

        Log::info('Patient registered successfully: ' . $user->email);
        return response()->json(['message' => 'Registration successful. Please check your email for verification.']);
    }

    public function registerPro(Request $request)
    {
        Log::info('Registration attempt for professional with email: ' . $request->email);

        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
            'firstname' => 'required|string',
            'lastname' => 'required|string',
            'birthdate' => 'required|date',
            'phone' => 'required|string',
            'address' => 'required|string',
            'address_complement' => 'nullable|string',
            'zipcode' => 'required|string',
            'city' => 'required|string',
            'country' => 'required|string',
            'languages' => 'required|array',
            'experience' => 'required|integer',
            'certification' => 'required|string',
            'company_name' => 'required|string',
            'medical_identification_number' => 'required|string',
            'company_identification_number' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!$this->validationService->isValidMedicalId($request->medical_identification_number)) {
            return response()->json(['message' => 'Invalid medical identification number'], 422);
        }

        if (!$this->validationService->isValidCompanyId($request->company_identification_number)) {
            return response()->json(['message' => 'Invalid company identification number'], 422);
        }

        if (!$this->govApiService->verifyMedicalId($request->medical_identification_number)) {
            return response()->json(['message' => 'Medical identification number not found in government database'], 422);
        }

        if (!$this->govApiService->verifyCompanyId($request->company_identification_number)) {
            return response()->json(['message' => 'Company identification number not found in government database'], 422);
        }

        $user = $this->authService->registerPro($validator->validated());
        $token = $user->createToken('email-verify', ['*'], now()->addHours(24))->plainTextToken;

        try {
            $this->emailService->sendRegistrationEmail([
                'email' => $user->email,
                'firstname' => $user->firstname,
                'lastname' => $user->lastname
            ], $token);
        } catch (\Exception $e) {
            Log::error('Failed to send verification email', ['error' => $e->getMessage()]);
        }

        Log::info('Professional registered successfully: ' . $user->email);
        return response()->json(['message' => 'Registration successful. Please check your email for verification.']);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        Log::info('Login attempt for user: ' . $request->email);

        $user = User::where('email', $request->email)->first();

        if ($user && !$user->email_verified) {
            Log::warning('Login attempt with unverified email: ' . $request->email);
            return response()->json([
                'message' => 'Please verify your email address before logging in',
                'error' => 'email_not_verified'
            ], 403);
        }

        if (!Auth::attempt($validator->validated())) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = User::where('email', $request->email)->first();
        $token = $user->createToken('auth-token')->plainTextToken;

        Log::info('User logged in successfully: ' . $request->email);
        return response()->json(['token' => $token]);
    }

    public function verify(Request $request)
    {
        Log::info('Email verification attempt with token: ' . $request->token);

        $token = explode('|', $request->token)[1] ?? null;
        if (!$token) {
            return redirect('http://localhost:4200/auth/login?status=error&message=Invalid token format');
        }

        $accessToken = \Laravel\Sanctum\PersonalAccessToken::where('token', hash('sha256', $token))
            ->where('name', 'email-verify')
            ->where(function ($query) {
                $query->where('expires_at', '>', now())
                    ->orWhereNull('expires_at');
            })
            ->first();

        if (!$accessToken) {
            Log::warning('Invalid or expired token: ' . $request->token);
            return redirect('http://localhost:4200/auth/login?status=error&message=Invalid or expired verification token');
        }

        $user = $accessToken->tokenable;
        $user->update(['email_verified' => true]);
        $accessToken->delete();

        Log::info('Email verified successfully for user: ' . $user->email);
        return redirect('http://localhost:4200/auth/login?status=success&message=Email verified successfully');
    }

    public function userProfile(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }

            // Charger la relation de rôle
            $user->load('role');

            // Préparer les données de base de l'utilisateur
            $userData = [
                'uuid' => $user->uuid,
                'id' => $user->id,
                'email' => $user->email,
                'firstname' => $user->firstname,
                'lastname' => $user->lastname,
                'birthdate' => $user->birthdate,
                'language' => $user->language,
                'role' => $user->role,
                'phone' => $user->phone,
                'address' => $user->address,
                'address_complement' => $user->address_complement,
                'zipcode' => $user->zipcode,
                'city' => $user->city,
                'country' => $user->country,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at
            ];

            // Charger et ajouter les données spécifiques au rôle
            if ($user->role && $user->role->name === 'ROLE_PRO') {
                // Charger la relation professional avec tous ses attributs
                $user->load('professional');

                if ($user->professional) {
                    $userData['professional'] = [
                        'uuid' => $user->professional->uuid,
                        'company_name' => $user->professional->company_name,
                        'medical_identification_number' => $user->professional->medical_identification_number,
                        'company_identification_number' => $user->professional->company_identification_number,
                        'biography' => $user->professional->biography,
                        'experience' => $user->professional->experience,
                        'certification' => $user->professional->certification,
                        'languages' => $user->professional->languages,
                        'is_anonymous' => $user->professional->is_anonymous ?? false
                    ];

                    // Charger les domaines de thérapie si nécessaire
                    if (method_exists($user->professional, 'therapyDomains')) {
                        $user->professional->load('therapyDomains');
                        $userData['professional']['therapy_domains'] = $user->professional->therapyDomains;

                        // Extraire les spécialités des domaines de thérapie
                        $specialties = [];
                        foreach ($user->professional->therapyDomains as $domain) {
                            $specialties[] = $domain->name;
                        }
                        $userData['professional']['specialties'] = $specialties;
                    }
                }
            } elseif ($user->role && $user->role->name === 'ROLE_PATIENT') {
                // Charger la relation patient
                $user->load('patient');

                if ($user->patient) {
                    $userData['patient'] = [
                        'uuid' => $user->patient->uuid,
                        'gender' => $user->patient->gender,
                        'is_anonymous' => $user->patient->is_anonymous ?? false
                    ];
                }
            }

            return response()->json($userData);
        } catch (\Exception $e) {
            // Log l'erreur
            Log::error('Erreur lors de la récupération du profil utilisateur', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la récupération du profil',
                'error' => $e->getMessage()
            ], 500);
        }
        // Supprimer cette ligne qui cause l'erreur:
        // return response()->json($userData);
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            return response()->json(['message' => 'Déconnexion réussie']);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la déconnexion', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la déconnexion',
                'error' => $e->getMessage()
            ], 500);
        }


        return response()->json($userData);
    }

    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        Log::info('Password reset request for: ' . $request->email);

        $user = User::where('email', $request->email)->first();
        $token = $user->createToken('password-reset', ['*'], now()->addHours(24))->plainTextToken;

        try {
            $this->emailService->sendPasswordResetEmail([
                'email' => $user->email,
                'firstname' => $user->firstname,
                'lastname' => $user->lastname
            ], $token);
            
            Log::info('Password reset email sent to: ' . $user->email);
            return response()->json(['message' => 'Password reset email sent. Please check your email.']);
        } catch (\Exception $e) {
            Log::error('Failed to send password reset email', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error sending password reset email'], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'password' => 'required|min:8|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        Log::info('Password reset attempt with token');

        $token = explode('|', $request->token)[1] ?? null;
        if (!$token) {
            return response()->json(['message' => 'Invalid token format'], 400);
        }

        $accessToken = \Laravel\Sanctum\PersonalAccessToken::where('token', hash('sha256', $token))
            ->where('name', 'password-reset')
            ->where(function ($query) {
                $query->where('expires_at', '>', now())
                    ->orWhereNull('expires_at');
            })
            ->first();

        if (!$accessToken) {
            Log::warning('Invalid or expired password reset token');
            return response()->json(['message' => 'Invalid or expired reset token'], 400);
        }

        $user = $accessToken->tokenable;
        $user->update(['password' => bcrypt($request->password)]);
        $accessToken->delete();

        Log::info('Password reset successfully for user: ' . $user->email);
        return response()->json(['message' => 'Password reset successful. You can now login with your new password.']);
    }
}
