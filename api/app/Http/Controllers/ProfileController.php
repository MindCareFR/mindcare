<?php

namespace App\Http\Controllers;

use App\Services\EncryptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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