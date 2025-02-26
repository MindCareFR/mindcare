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
      return response()->json(['message' => 'Invalid token format'], 400);
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
      return response()->json(['message' => 'Invalid or expired verification token'], 400);
    }

    $user = $accessToken->tokenable;
    $user->update(['email_verified' => true]);
    $accessToken->delete();

    Log::info('Email verified successfully for user: ' . $user->email);
    return response()->json(['message' => 'Email verified successfully']);
  }
}
