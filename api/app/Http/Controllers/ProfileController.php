<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Professional;
use App\Models\Patient;
use App\Models\Review;
use App\Models\Preference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    /**
     * Afficher le profil de l'utilisateur connecté
     */
    public function show(Request $request)
    {
        $user = $request->user();

        // Charger les relations appropriées selon le rôle
        if ($user->role->name === 'ROLE_PRO') {
            $user->load('professional');
        } elseif ($user->role->name === 'ROLE_PATIENT') {
            $user->load('patient');
        }

        return response()->json($user);
    }

    /**
     * Mettre à jour les informations de base du profil
     */
    public function updateBasicInfo(Request $request)
    {
        $user = $request->user();

        Log::info('Tentative de mise à jour des informations de base', [
            'user_id' => $user->id,
            'data' => $request->all()
        ]);

        try {
            // Valider les données entrantes
            $validator = Validator::make($request->all(), [
                'firstname' => 'required|string|max:255',
                'lastname' => 'required|string|max:255',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'address_complement' => 'nullable|string|max:255',
                'zipcode' => 'nullable|string|max:20',
                'city' => 'nullable|string|max:100',
                'country' => 'nullable|string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Mettre à jour le modèle utilisateur avec les données validées
            $user->update($validator->validated());

            Log::info('Informations de base mises à jour avec succès', [
                'user_id' => $user->id
            ]);

            return response()->json([
                'message' => 'Informations de base mises à jour avec succès',
                'user' => $user
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour des informations de base', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la mise à jour des informations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher les détails du profil patient
     */
    public function showPatientDetails(Request $request, $uuid)
    {
        try {
            $patient = Patient::whereHas('user', function($query) use ($uuid) {
                $query->where('uuid', $uuid);
            })->with('user')->first();

            if (!$patient) {
                return response()->json(['message' => 'Patient non trouvé'], 404);
            }

            return response()->json($patient);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des détails du patient', [
                'uuid' => $uuid,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la récupération des détails du patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour le profil patient
     */
    public function updatePatientProfile(Request $request)
    {
        $user = $request->user();

        if ($user->role->name !== 'ROLE_PATIENT') {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        try {
            $validator = Validator::make($request->all(), [
                'gender' => 'nullable|string|max:1',
                'birthdate' => 'nullable|date',
                'is_anonymous' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $patient = $user->patient;

            if (!$patient) {
                $patient = new Patient();
                $patient->user_id = $user->id;
            }

            $patient->fill($validator->validated());
            $patient->save();

            // Si birthdate est fourni, mettre également à jour le champ dans user
            if ($request->has('birthdate')) {
                $user->birthdate = $request->birthdate;
                $user->save();
            }

            return response()->json([
                'message' => 'Profil patient mis à jour avec succès',
                'patient' => $patient
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour du profil patient', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la mise à jour du profil patient',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher les détails du profil professionnel
     */
    public function showProfessionalDetails(Request $request, $uuid)
    {
        try {
            $professional = Professional::whereHas('user', function($query) use ($uuid) {
                $query->where('uuid', $uuid);
            })->with(['user', 'reviews'])->first();

            if (!$professional) {
                return response()->json(['message' => 'Professionnel non trouvé'], 404);
            }

            return response()->json($professional);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des détails du professionnel', [
                'uuid' => $uuid,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la récupération des détails du professionnel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour le profil professionnel
     */
    public function updateProfessionalProfile(Request $request)
    {
        $user = $request->user();

        if ($user->role->name !== 'ROLE_PRO') {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        try {
            $validator = Validator::make($request->all(), [
                'company_name' => 'nullable|string|max:255',
                'medical_identification_number' => 'nullable|string|max:100',
                'company_identification_number' => 'nullable|string|max:100',
                'biography' => 'nullable|string',
                'experience' => 'nullable|integer',
                'certification' => 'nullable|string',
                'languages' => 'nullable|array',
                'specialties' => 'nullable|array',
                'availability_hours' => 'nullable|array',
                'is_anonymous' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $professional = $user->professional;

            if (!$professional) {
                $professional = new Professional();
                $professional->user_id = $user->id;
            }

            $data = $validator->validated();

            // Convertir les tableaux en JSON pour le stockage
            if (isset($data['languages'])) {
                $data['languages'] = json_encode($data['languages']);
            }

            if (isset($data['specialties'])) {
                $data['specialties'] = json_encode($data['specialties']);
            }

            if (isset($data['availability_hours'])) {
                $data['availability_hours'] = json_encode($data['availability_hours']);
            }

            $professional->fill($data);
            $professional->save();

            // Recharger les données pour s'assurer que les tableaux JSON sont correctement convertis
            $professional->refresh();

            return response()->json([
                'message' => 'Profil professionnel mis à jour avec succès',
                'professional' => $professional
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour du profil professionnel', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la mise à jour du profil professionnel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les avis reçus par le professionnel
     */
    public function getReviews(Request $request)
    {
        $user = $request->user();

        if ($user->role->name !== 'ROLE_PRO') {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        try {
            $professional = $user->professional;

            if (!$professional) {
                return response()->json(['message' => 'Profil professionnel non trouvé'], 404);
            }

            $reviews = $professional->reviews()->with('patient.user')->get();

            return response()->json($reviews);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des avis', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la récupération des avis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Soumettre un avis sur un professionnel
     */
    public function submitReview(Request $request, $uuid)
    {
        $user = $request->user();

        if ($user->role->name !== 'ROLE_PATIENT') {
            return response()->json(['message' => 'Accès non autorisé'], 403);
        }

        try {
            $professional = Professional::whereHas('user', function($query) use ($uuid) {
                $query->where('uuid', $uuid);
            })->first();

            if (!$professional) {
                return response()->json(['message' => 'Professionnel non trouvé'], 404);
            }

            $validator = Validator::make($request->all(), [
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'required|string',
                'is_anonymous' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $patient = $user->patient;

            if (!$patient) {
                return response()->json(['message' => 'Profil patient non trouvé'], 404);
            }

            $review = new Review();
            $review->professional_id = $professional->id;
            $review->patient_id = $patient->id;
            $review->rating = $request->rating;
            $review->comment = $request->comment;
            $review->is_anonymous = $request->is_anonymous ?? false;
            $review->save();

            // Mettre à jour la note moyenne du professionnel
            $professional->updateAverageRating();

            return response()->json([
                'message' => 'Avis soumis avec succès',
                'review' => $review
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la soumission d\'un avis', [
                'user_id' => $user->id,
                'professional_uuid' => $uuid,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la soumission de l\'avis',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Initialiser les préférences par défaut
     */
    public function initPreferences(Request $request)
    {
        $user = $request->user();

        try {
            $preference = $user->preference;

            if (!$preference) {
                $preference = new Preference();
                $preference->user_id = $user->id;

                // Définir les préférences par défaut
                $defaultPreferences = [
                    'app_notifications' => [
                        'messages' => true,
                        'appointments' => true,
                        'reminders' => true,
                        'updates' => false
                    ],
                    'push_notifications' => [
                        'messages' => true,
                        'appointments' => true,
                        'reminders' => true,
                        'updates' => false
                    ],
                    'email_notifications' => [
                        'messages' => false,
                        'appointments' => true,
                        'reminders' => true,
                        'updates' => false,
                        'newsletter' => false
                    ],
                    'profile_visibility' => [
                        'full_name' => true,
                        'email' => false,
                        'phone' => false,
                        'address' => false,
                        'certification' => true,
                        'specialties' => true,
                        'biography' => true,
                        'experience' => true
                    ]
                ];

                $preference->preferences = json_encode($defaultPreferences);
                $preference->save();
            }

            // Convertir les préférences JSON en tableau
            $preferenceData = json_decode($preference->preferences, true);

            return response()->json($preferenceData);

        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'initialisation des préférences', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de l\'initialisation des préférences',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour les préférences
     */
    public function updatePreferences(Request $request)
    {
        $user = $request->user();

        try {
            $validator = Validator::make($request->all(), [
                'app_notifications' => 'required|array',
                'push_notifications' => 'required|array',
                'email_notifications' => 'required|array',
                'profile_visibility' => 'required|array'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $preference = $user->preference;

            if (!$preference) {
                $preference = new Preference();
                $preference->user_id = $user->id;
            }

            $preference->preferences = json_encode($request->all());
            $preference->save();

            return response()->json([
                'message' => 'Préférences mises à jour avec succès',
                'preferences' => json_decode($preference->preferences)
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour des préférences', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la mise à jour des préférences',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher le profil public d'un utilisateur
     */
    public function showPublic($uuid)
    {
        try {
            $user = User::where('uuid', $uuid)->first();

            if (!$user) {
                return response()->json(['message' => 'Utilisateur non trouvé'], 404);
            }

            // Déterminer quel type de profil afficher
            if ($user->role->name === 'ROLE_PRO') {
                $user->load('professional');

                // Si le professionnel est en mode anonyme, masquer certaines informations
                if ($user->professional && $user->professional->is_anonymous) {
                    // Masquer les informations sensibles
                    $user->makeHidden(['email', 'phone', 'address', 'address_complement', 'zipcode', 'city', 'country']);
                }

            } elseif ($user->role->name === 'ROLE_PATIENT') {
                $user->load('patient');

                // Si le patient est en mode anonyme, masquer certaines informations
                if ($user->patient && $user->patient->is_anonymous) {
                    // Masquer les informations sensibles
                    $user->makeHidden(['email', 'phone', 'address', 'address_complement', 'zipcode', 'city', 'country', 'lastname']);
                    $user->firstname = substr($user->firstname, 0, 1) . '.'; // Juste l'initiale
                }
            }

            return response()->json($user);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération du profil public', [
                'uuid' => $uuid,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la récupération du profil public',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activer/désactiver le mode anonyme pour le professionnel
     */
    public function toggleAnonymousMode(Request $request)
    {
        $user = $request->user();

        if ($user->role->name !== 'ROLE_PRO') {
            return response()->json(['message' => 'Cette fonctionnalité est réservée aux professionnels'], 403);
        }

        try {
            $professional = $user->professional;

            if (!$professional) {
                return response()->json(['message' => 'Profil professionnel non trouvé'], 404);
            }

            // Inverser le statut d'anonymat
            $professional->is_anonymous = !$professional->is_anonymous;
            $professional->save();

            return response()->json([
                'message' => $professional->is_anonymous ?
                    'Mode anonyme activé avec succès' :
                    'Mode anonyme désactivé avec succès',
                'is_anonymous' => $professional->is_anonymous
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors du changement du mode anonyme', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors du changement du mode anonyme',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
