<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserPreference;
use App\Models\UserPatient;
use App\Models\UserProfessional;
use App\Models\UserReview;
use App\Services\EncryptionService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ProfileService
{
    private EncryptionService $encryptionService;

    public function __construct(EncryptionService $encryptionService)
    {
        $this->encryptionService = $encryptionService;
    }

    /**
     * Récupère le profil complet d'un utilisateur avec ses relations
     * 
     * @param string $uuid UUID de l'utilisateur
     * @return User
     */
    public function getUserProfile(string $uuid): User
    {
        $user = User::where('uuid', $uuid)->firstOrFail();
        $user->load(['preferences', 'role']);

        // Déchiffrer les données sensibles de l'utilisateur
        $this->decryptUserData($user);

        if ($user->isProfessional()) {
            $user->load(['professionalProfile.therapyDomains']);
            
            // Déchiffrer les données sensibles du profil professionnel
            if ($user->professionalProfile) {
                $this->decryptProfessionalData($user->professionalProfile);
            }
        } elseif ($user->isPatient()) {
            $user->load(['patientProfile']);
        }

        return $user;
    }

    /**
     * Récupère le profil public d'un utilisateur
     * 
     * @param string $uuid UUID de l'utilisateur
     * @return array
     */
    public function getPublicProfile(string $uuid): array
    {
        $user = User::findOrFail($uuid);
        
        // Déchiffrer les données de l'utilisateur avant de générer le profil public
        $this->decryptUserData($user);
        
        if ($user->isProfessional() && $user->professionalProfile) {
            $this->decryptProfessionalData($user->professionalProfile);
        }
        
        $publicProfile = $user->getPublicProfile();

        if ($user->isProfessional()) {
            $reviews = UserReview::where('professional_uuid', $uuid)
                ->where('is_approved', true)
                ->with(['reviewer' => function ($query) {
                    $query->select('uuid', 'firstname', 'lastname');
                }])
                ->get()
                ->map(function ($review) {
                    if ($review->is_anonymous) {
                        unset($review->reviewer);
                        $review->reviewer_name = 'Anonyme';
                    } else {
                        $review->reviewer_name = $review->reviewer->full_name;
                        unset($review->reviewer);
                    }
                    return $review;
                });

            $publicProfile['reviews'] = $reviews;
            $publicProfile['average_rating'] = $reviews->avg('rating') ?? 0;
            $publicProfile['reviews_count'] = $reviews->count();
        }

        return $publicProfile;
    }

    /**
     * Met à jour les informations de base du profil
     * 
     * @param string $uuid UUID de l'utilisateur
     * @param array $data Données du profil
     * @param UploadedFile|null $profileImage Image de profil à télécharger
     * @return User
     */
    public function updateBasicInfo(string $uuid, array $data, ?UploadedFile $profileImage = null): User
    {
        $user = User::where('uuid', $uuid)->firstOrFail();

        // Gestion de l'image de profil
        if ($profileImage) {
            if ($user->profile_image) {
                Storage::disk('public')->delete($user->profile_image);
            }

            $path = $profileImage->store('profile_images', 'public');
            $data['profile_image'] = $path;
        }

        // Chiffrer les données sensibles
        $sensitiveFields = ['birthdate', 'zipcode', 'address', 'address_complement', 'phone'];
        
        foreach ($sensitiveFields as $field) {
            if (isset($data[$field]) && !empty($data[$field])) {
                $data[$field] = $this->encryptionService->encryptData($data[$field]);
            }
        }

        $user->update($data);
        
        // Déchiffrer les données pour la réponse
        $this->decryptUserData($user);

        return $user;
    }

    /**
     * Met à jour les préférences de l'utilisateur
     * 
     * @param string $uuid UUID de l'utilisateur
     * @param array $data Données des préférences
     * @return UserPreference
     */
    public function updatePreferences(string $uuid, array $data): UserPreference
    {
        $user = User::where('uuid', $uuid)->firstOrFail();
        $preferences = $user->preferences ?? new UserPreference(['user_uuid' => $user->uuid]);

        if (isset($data['app_notifications'])) {
            $preferences->app_notifications = $data['app_notifications'];
        }

        if (isset($data['push_notifications'])) {
            $preferences->push_notifications = $data['push_notifications'];
        }

        if (isset($data['email_notifications'])) {
            $preferences->email_notifications = $data['email_notifications'];
        }

        if (isset($data['profile_visibility'])) {
            $preferences->profile_visibility = $data['profile_visibility'];
        }

        $preferences->save();

        return $preferences;
    }

    /**
     * Met à jour le profil professionnel
     * 
     * @param string $uuid UUID de l'utilisateur
     * @param array $data Données du profil professionnel
     * @return UserProfessional
     * @throws RuntimeException
     */
    public function updateProfessionalProfile(string $uuid, array $data): UserProfessional
    {
        $user = User::where('uuid', $uuid)->firstOrFail();

        if (!$user->isProfessional()) {
            throw new RuntimeException('Seuls les professionnels peuvent mettre à jour ce type de profil', 403);
        }

        $professionalProfile = $user->professionalProfile ?? new UserProfessional(['uuid' => $user->uuid]);

        $fillableFields = [
            'languages',
            'experience',
            'certification',
            'specialties',
            'availability_hours',
            'biography',
            'education',
            'company_name'
        ];

        // Champs à encrypter
        $encryptedFields = [
            'medical_identification_number',
            'company_identification_number'
        ];

        foreach ($fillableFields as $field) {
            if (isset($data[$field])) {
                $professionalProfile->{$field} = $data[$field];
            }
        }

        // Chiffrer les données sensibles
        foreach ($encryptedFields as $field) {
            if (isset($data[$field])) {
                $professionalProfile->{$field} = $this->encryptionService->encryptData($data[$field]);
            }
        }

        $professionalProfile->save();

        // Mise à jour des domaines de thérapie
        if (isset($data['therapy_domains'])) {
            $professionalProfile->therapyDomains()->sync($data['therapy_domains']);
        }

        $professionalProfile->load(['therapyDomains', 'user']);

        // Déchiffrer les données pour la réponse
        $this->decryptProfessionalData($professionalProfile);

        return $professionalProfile;
    }

    /**
     * Met à jour le profil patient
     * 
     * @param string $uuid UUID de l'utilisateur
     * @param array $data Données du profil patient
     * @return UserPatient
     * @throws RuntimeException
     */
    public function updatePatientProfile(string $uuid, array $data): UserPatient
    {
        $user = User::where('uuid', $uuid)->firstOrFail();

        if (!$user->isPatient()) {
            throw new RuntimeException('Seuls les patients peuvent mettre à jour ce type de profil', 403);
        }

        if (isset($data['birthdate'])) {
            // Chiffrer la date de naissance
            $user->birthdate = $this->encryptionService->encryptData($data['birthdate']);
            $user->save();
        }

        $patientProfile = $user->patientProfile ?? new UserPatient(['uuid' => $user->uuid]);

        if (isset($data['gender'])) {
            $patientProfile->gender = $data['gender'];
        }

        if (isset($data['is_anonymous'])) {
            $patientProfile->is_anonymous = $data['is_anonymous'];
        }

        $patientProfile->save();
        $patientProfile->load('user');
        
        // Déchiffrer les données pour la réponse
        if ($patientProfile->user) {
            $this->decryptUserData($patientProfile->user);
        }

        return $patientProfile;
    }

    /**
     * Soumet une évaluation pour un professionnel
     * 
     * @param string $reviewerUuid UUID du patient qui soumet l'évaluation
     * @param string $professionalUuid UUID du professionnel évalué
     * @param array $data Données de l'évaluation
     * @return UserReview
     * @throws RuntimeException
     */
    public function submitReview(string $reviewerUuid, string $professionalUuid, array $data): UserReview
    {
        $user = User::where('uuid', $reviewerUuid)->firstOrFail();

        if (!$user->isPatient()) {
            throw new RuntimeException('Seuls les patients peuvent soumettre des évaluations', 403);
        }

        Log::info("Professional UUID", ['uuid' => $professionalUuid]);

        $professional = User::where('uuid', $professionalUuid)
            ->whereHas('role', function ($query) {
                $query->where('name', 'ROLE_PRO');
            })
            ->first();

        if (!$professional) {
            throw new RuntimeException('Professionnel non trouvé', 404);
        }

        $review = UserReview::updateOrCreate(
            [
                'reviewer_uuid' => $reviewerUuid,
                'professional_uuid' => $professionalUuid
            ],
            [
                'rating' => $data['rating'],
                'comment' => $data['comment'] ?? null,
                'is_anonymous' => $data['is_anonymous'] ?? false,
                'is_approved' => false
            ]
        );

        return $review;
    }

    /**
     * Récupère les évaluations reçues par un professionnel
     * 
     * @param string $uuid UUID du professionnel
     * @return array
     * @throws RuntimeException
     */
    public function getReviewsForProfessional(string $uuid): array
    {
        $user = User::where('uuid', $uuid)->firstOrFail();

        if (!$user->isProfessional()) {
            throw new RuntimeException('Seuls les professionnels peuvent voir leurs évaluations', 403);
        }

        $reviews = $user->receivedReviews()
            ->with(['reviewer' => function ($query) {
                $query->select('uuid', 'firstname', 'lastname');
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($review) {
                if ($review->is_anonymous) {
                    unset($review->reviewer);
                    $review->reviewer_name = 'Anonyme';
                } else {
                    $review->reviewer_name = $review->reviewer->full_name;
                    unset($review->reviewer);
                }
                return $review;
            });

        return [
            'reviews' => $reviews,
            'average_rating' => $reviews->where('is_approved', true)->avg('rating') ?? 0,
            'reviews_count' => $reviews->where('is_approved', true)->count()
        ];
    }

    /**
     * Initialise les préférences par défaut d'un utilisateur
     * 
     * @param string $uuid UUID de l'utilisateur
     * @return UserPreference
     * @throws RuntimeException
     */
    public function initDefaultPreferences(string $uuid): UserPreference
    {
        $user = User::where('uuid', $uuid)->firstOrFail();

        if ($user->preferences) {
            throw new RuntimeException('Les préférences sont déjà initialisées', 400);
        }

        $preferences = new UserPreference([
            'user_uuid' => $user->uuid,
            'app_notifications' => UserPreference::getDefaultAppNotifications(),
            'push_notifications' => UserPreference::getDefaultPushNotifications(),
            'email_notifications' => UserPreference::getDefaultEmailNotifications(),
            'profile_visibility' => UserPreference::getDefaultProfileVisibility($user->role_name)
        ]);

        $preferences->save();

        return $preferences;
    }

    /**
     * Déchiffre les données sensibles d'un profil professionnel
     * 
     * @param UserProfessional $profile
     * @return void
     */
    private function decryptProfessionalData(UserProfessional $profile): void
    {
        $encryptedFields = [
            'medical_identification_number',
            'company_identification_number'
        ];

        foreach ($encryptedFields as $field) {
            if ($profile->{$field} && $this->encryptionService->isEncrypted($profile->{$field})) {
                try {
                    $profile->{$field} = $this->encryptionService->decryptData($profile->{$field});
                } catch (\Exception $e) {
                    Log::error('Erreur lors du déchiffrement des données du profil professionnel', [
                        'field' => $field,
                        'error' => $e->getMessage()
                    ]);
                    // On laisse la valeur telle quelle en cas d'erreur
                }
            }
        }
    }
    
    /**
     * Déchiffre les données sensibles d'un utilisateur
     * 
     * @param User $user
     * @return void
     */
    private function decryptUserData(User $user): void
    {
        $encryptedFields = [
            'birthdate',
            'phone',
            'address',
            'address_complement',
            'zipcode'
        ];

        foreach ($encryptedFields as $field) {
            if ($user->{$field} && $this->encryptionService->isEncrypted($user->{$field})) {
                try {
                    $user->{$field} = $this->encryptionService->decryptData($user->{$field});
                } catch (\Exception $e) {
                    Log::error('Erreur lors du déchiffrement des données utilisateur', [
                        'field' => $field,
                        'error' => $e->getMessage()
                    ]);
                    // On laisse la valeur telle quelle en cas d'erreur
                }
            }
        }
    }
}