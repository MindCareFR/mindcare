<?php

namespace App\Http\Controllers;

use App\Services\EncryptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    protected $encryptionService;

    public function __construct(EncryptionService $encryptionService)
    {
        $this->encryptionService = $encryptionService;
    }

    /**
     * Retourne les informations du profil de l'utilisateur connecté (déchiffrées)
     */
    public function showMe(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }

        if ($user->role && $user->role->name === 'ROLE_PRO') {
            $user->load('professional');
        } elseif ($user->role && $user->role->name === 'ROLE_PATIENT') {
            $user->load('patient');
        }

        $userData = $this->decryptUserData($user);

        return response()->json($userData);
    }

    /**
     * Met à jour les informations de base de l'utilisateur
     */
    public function updateBasic(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }

        $validator = Validator::make($request->all(), [
            'firstname' => 'sometimes|string',
            'lastname' => 'sometimes|string',
            'email' => 'sometimes|email|unique:users,email,'.$user->uuid.',uuid',
            'phone' => 'sometimes|string',
            'address' => 'sometimes|string',
            'address_complement' => 'sometimes|nullable|string',
            'zipcode' => 'sometimes|string',
            'city' => 'sometimes|string',
            'country' => 'sometimes|string',
            'birthdate' => 'sometimes|date'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Filtrer les champs validés
        $validData = $validator->validated();

        // Champs à chiffrer
        $fieldsToEncrypt = ['phone', 'address', 'address_complement', 'zipcode'];

        // Chiffrement des données sensibles
        foreach ($fieldsToEncrypt as $field) {
            if (isset($validData[$field]) && !empty($validData[$field])) {
                $validData[$field] = $this->encryptionService->encryptData($validData[$field]);
            }
        }

        // Mise à jour des données utilisateur
        $user->update($validData);

        Log::info('Informations de base mises à jour', ['user_uuid' => $user->uuid]);

        return response()->json([
            'message' => 'Informations mises à jour avec succès',
            'user' => $this->decryptUserData($user->fresh())
        ]);
    }

    /**
     * Met à jour les informations professionnelles
     */
    public function updateProfessional(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }

        if (!$user->role || $user->role->name !== 'ROLE_PRO') {
            return response()->json(['message' => 'Accès non autorisé. Rôle professionnel requis.'], 403);
        }

        $user->load('professional');

        if (!$user->professional) {
            return response()->json(['message' => 'Profil professionnel introuvable'], 404);
        }

        $validator = Validator::make($request->all(), [
            'company_name' => 'sometimes|string',
            'medical_identification_number' => 'sometimes|string',
            'company_identification_number' => 'sometimes|string',
            'biography' => 'sometimes|nullable|string|max:500',
            'experience' => 'sometimes|integer|min:0|max:50',
            'certification' => 'sometimes|string',
            'languages' => 'sometimes|array',
            'specialties' => 'sometimes|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Filtrer les champs validés
        $validData = $validator->validated();

        // Champs à chiffrer
        $fieldsToEncrypt = [
            'company_name',
            'medical_identification_number',
            'company_identification_number',
            'biography',
            'certification'
        ];

        // Chiffrement des données sensibles
        foreach ($fieldsToEncrypt as $field) {
            if (isset($validData[$field]) && !empty($validData[$field])) {
                $validData[$field] = $this->encryptionService->encryptData($validData[$field]);
            }
        }

        // Supprimer les spécialités du tableau car elles sont gérées séparément
        $specialties = $validData['specialties'] ?? null;
        unset($validData['specialties']);

        // Mise à jour des données professionnelles
        $user->professional->update($validData);

        // Mettre à jour les spécialités si elles ont été fournies
        if ($specialties !== null && method_exists($user->professional, 'therapyDomains')) {
            // Logique pour synchroniser les domaines de thérapie
            // Cela dépend de votre implémentation exacte
            // Par exemple, vous pourriez avoir une méthode syncTherapyDomains
        }

        Log::info('Informations professionnelles mises à jour', ['user_uuid' => $user->uuid]);

        return response()->json([
            'message' => 'Informations professionnelles mises à jour avec succès',
            'user' => $this->decryptUserData($user->fresh(['professional']))
        ]);
    }

    /**
     * Met à jour les informations du patient
     */
    public function updatePatient(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }

        if (!$user->role || $user->role->name !== 'ROLE_PATIENT') {
            return response()->json(['message' => 'Accès non autorisé. Rôle patient requis.'], 403);
        }

        $user->load('patient');

        if (!$user->patient) {
            return response()->json(['message' => 'Profil patient introuvable'], 404);
        }

        $validator = Validator::make($request->all(), [
            'gender' => 'sometimes|string|in:male,female,other',
            'birthdate' => 'sometimes|date'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Filtrer les champs validés
        $validData = $validator->validated();

        // Chiffrer le genre si fourni
        if (isset($validData['gender']) && !empty($validData['gender'])) {
            $validData['gender'] = $this->encryptionService->encryptData($validData['gender']);
        }

        // Mise à jour des données patient
        $user->patient->update($validData);

        Log::info('Informations patient mises à jour', ['user_uuid' => $user->uuid]);

        return response()->json([
            'message' => 'Informations patient mises à jour avec succès',
            'user' => $this->decryptUserData($user->fresh(['patient']))
        ]);
    }

    /**
     * Active/désactive le mode anonyme pour l'utilisateur
     */
    public function toggleAnonymous(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non authentifié'], 401);
        }

        if ($user->role && $user->role->name === 'ROLE_PRO') {
            $user->load('professional');

            if (!$user->professional) {
                return response()->json(['message' => 'Profil professionnel introuvable'], 404);
            }

            $currentValue = (bool)$user->professional->is_anonymous;
            $user->professional->update(['is_anonymous' => !$currentValue]);

            $isNowAnonymous = !$currentValue;

        } elseif ($user->role && $user->role->name === 'ROLE_PATIENT') {
            $user->load('patient');

            if (!$user->patient) {
                return response()->json(['message' => 'Profil patient introuvable'], 404);
            }

            $currentValue = (bool)$user->patient->is_anonymous;
            $user->patient->update(['is_anonymous' => !$currentValue]);

            $isNowAnonymous = !$currentValue;

        } else {
            return response()->json(['message' => 'Type de profil non supporté'], 400);
        }

        Log::info('Mode anonyme basculé', [
            'user_uuid' => $user->uuid,
            'is_now_anonymous' => $isNowAnonymous
        ]);

        return response()->json([
            'message' => $isNowAnonymous ? 'Mode anonyme activé' : 'Mode anonyme désactivé',
            'is_anonymous' => $isNowAnonymous
        ]);
    }

    /**
     * Méthode pour déchiffrer les données utilisateur
     */
    protected function decryptUserData($user)
    {
        $userData = $user->toArray();

        $fieldsToDecrypt = ['phone', 'address', 'address_complement', 'zipcode'];

        foreach ($fieldsToDecrypt as $field) {
            if (isset($userData[$field]) && !empty($userData[$field])) {
                $userData[$field] = $this->encryptionService->decryptData($userData[$field]);
            }
        }

        if (isset($userData['patient']) && !empty($userData['patient'])) {
            if (isset($userData['patient']['gender']) && !empty($userData['patient']['gender'])) {
                $userData['patient']['gender'] = $this->encryptionService->decryptData($userData['patient']['gender']);
            }
        }

        if (isset($userData['professional']) && !empty($userData['professional'])) {
            $proFieldsToDecrypt = [
                'company_name',
                'medical_identification_number',
                'company_identification_number',
                'biography',
                'certification'
            ];

            foreach ($proFieldsToDecrypt as $field) {
                if (isset($userData['professional'][$field]) && !empty($userData['professional'][$field])) {
                    $userData['professional'][$field] = $this->encryptionService->decryptData($userData['professional'][$field]);
                }
            }
        }

        Log::info('Données utilisateur déchiffrées avec succès', ['user_uuid' => $userData['uuid'] ?? 'unknown']);

        return $userData;
    }
}
