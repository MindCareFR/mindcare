<?php

namespace App\Http\Controllers;

use App\Services\ProfileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
  private ProfileService $profileService;

  public function __construct(ProfileService $profileService)
  {
    $this->profileService = $profileService;
  }

  /**
   * Afficher le profil de l'utilisateur connecté
   */
  public function showMyProfile()
  {
    $loggedUser = Auth::user();
    $profile = $this->profileService->getUserProfile($loggedUser->uuid);

    return response()->json([
      'success' => true,
      'data' => $profile
    ]);
  }

  /**
   * Afficher un profil public
   */
  public function showPublicProfile($uuid)
  {
    $publicProfile = $this->profileService->getPublicProfile($uuid);

    return response()->json([
      'success' => true,
      'data' => $publicProfile
    ]);
  }

  /**
   * Mettre à jour les informations de base du profil
   */
  public function updateBasicInfo(Request $request)
  {
    $loggedUser = Auth::user();
    
    $validator = Validator::make($request->all(), [
      'firstname' => 'sometimes|string|max:255',
      'lastname' => 'sometimes|string|max:255',
      'phone' => 'sometimes|string|max:20',
      'address' => 'sometimes|string|max:255',
      'address_complement' => 'sometimes|nullable|string|max:255',
      'zipcode' => 'sometimes|string|max:20',
      'city' => 'sometimes|string|max:100',
      'country' => 'sometimes|string|max:100',
      'profile_image' => 'sometimes|nullable|image|max:2048',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'errors' => $validator->errors()
      ], 422);
    }

    $profileData = $validator->validated();
    $profileImagePath = null;

    if ($request->hasFile('profile_image')) {
      $profileImagePath = $request->file('profile_image');
    }

    $updatedUser = $this->profileService->updateBasicInfo($loggedUser->uuid, $profileData, $profileImagePath);

    return response()->json([
      'success' => true,
      'message' => 'Profil mis à jour avec succès',
      'data' => $updatedUser
    ]);
  }

  /**
   * Mettre à jour les préférences de l'utilisateur
   */
  public function updatePreferences(Request $request)
  {
    $loggedUser = Auth::user();
    
    $validator = Validator::make($request->all(), [
      'app_notifications' => 'sometimes|array',
      'push_notifications' => 'sometimes|array',
      'email_notifications' => 'sometimes|array',
      'profile_visibility' => 'sometimes|array',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'errors' => $validator->errors()
      ], 422);
    }

    $preferences = $this->profileService->updatePreferences($loggedUser->uuid, $validator->validated());

    return response()->json([
      'success' => true,
      'message' => 'Préférences mises à jour avec succès',
      'data' => $preferences
    ]);
  }

  /**
   * Mettre à jour le profil professionnel
   */
  public function updateProfessionalProfile(Request $request)
  {
    $loggedUser = Auth::user();
    
    $validator = Validator::make($request->all(), [
      'languages' => 'sometimes|array',
      'experience' => 'sometimes|integer',
      'certification' => 'sometimes|string',
      'specialties' => 'sometimes|array',
      'availability_hours' => 'sometimes|array',
      'biography' => 'sometimes|string',
      'education' => 'sometimes|array',
      'company_name' => 'sometimes|string|max:255',
      'medical_identification_number' => 'sometimes|string|max:255',
      'company_identification_number' => 'sometimes|string|max:255',
      'therapy_domains' => 'sometimes|array',
      'therapy_domains.*' => 'exists:therapy_domains,id',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'errors' => $validator->errors()
      ], 422);
    }

    try {
      $professionalProfile = $this->profileService->updateProfessionalProfile(
        $loggedUser->uuid, 
        $validator->validated()
      );

      return response()->json([
        'success' => true,
        'message' => 'Profil professionnel mis à jour avec succès',
        'data' => $professionalProfile
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage()
      ], $e->getCode() ?: 500);
    }
  }

  /**
   * Mettre à jour le profil patient
   */
  public function updatePatientProfile(Request $request)
  {
    $loggedUser = Auth::user();
    
    $validator = Validator::make($request->all(), [
      'gender' => ['sometimes', Rule::in(['Homme', 'Femme', 'Autre'])],
      'is_anonymous' => 'sometimes|boolean',
      'birthdate' => 'sometimes|date'
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'errors' => $validator->errors()
      ], 422);
    }

    try {
      $patientProfile = $this->profileService->updatePatientProfile(
        $loggedUser->uuid, 
        $validator->validated()
      );

      return response()->json([
        'success' => true,
        'message' => 'Profil patient mis à jour avec succès',
        'data' => $patientProfile
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage()
      ], $e->getCode() ?: 500);
    }
  }

  /**
   * Soumettre une évaluation pour un professionnel
   */
  public function submitReview(Request $request, $professionalUuid)
  {
    $loggedUser = Auth::user();
    
    $validator = Validator::make($request->all(), [
      'rating' => 'required|integer|min:1|max:5',
      'comment' => 'nullable|string|max:1000',
      'is_anonymous' => 'sometimes|boolean'
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'errors' => $validator->errors()
      ], 422);
    }

    try {
      $review = $this->profileService->submitReview(
        $loggedUser->uuid,
        $professionalUuid,
        $validator->validated()
      );

      return response()->json([
        'success' => true,
        'message' => 'Évaluation soumise avec succès, en attente d\'approbation',
        'data' => $review
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage()
      ], $e->getCode() ?: 500);
    }
  }

  /**
   * Obtenir les évaluations reçues (pour les professionnels)
   */
  public function getMyReviews()
  {
    $loggedUser = Auth::user();

    try {
      $reviewsData = $this->profileService->getReviewsForProfessional($loggedUser->uuid);

      return response()->json([
        'success' => true,
        'data' => $reviewsData
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage()
      ], $e->getCode() ?: 500);
    }
  }

  /**
   * Initialiser les préférences par défaut
   */
  public function initDefaultPreferences()
  {
    $loggedUser = Auth::user();

    try {
      $preferences = $this->profileService->initDefaultPreferences($loggedUser->uuid);

      return response()->json([
        'success' => true,
        'message' => 'Préférences initialisées avec succès',
        'data' => $preferences
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'success' => false,
        'message' => $e->getMessage()
      ], $e->getCode() ?: 500);
    }
  }
}