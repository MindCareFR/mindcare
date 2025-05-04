<?php

namespace App\Http\Controllers;

use App\Services\PlanningService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\PlanningAvailability;
use App\Models\UserProfessional;

class PlanningController extends Controller
{
    protected $planningService;

    public function __construct(PlanningService $planningService)
    {
        $this->planningService = $planningService;
    }

    public function setProfessionalPlanning(Request $request)
    {
        try {
            // Log de débogage
            Log::info('Requête de création de planning reçue', [
                'input' => $request->all(),
                'user' => Auth::user()
            ]);

            // Récupérer l'utilisateur authentifié manuellement
            $user = Auth::guard('sanctum')->user();

            if (!$user) {
                Log::error('Utilisateur non authentifié');
                return response()->json(['message' => 'Utilisateur non authentifié'], 401);
            }

            // Vérification du rôle (optionnel)
            if ($user->role->name !== 'ROLE_PRO') {
                Log::error('Tentative de création de planning par un non-professionnel', [
                    'user_role' => $user->role->name
                ]);
                return response()->json(['message' => 'Seuls les professionnels peuvent définir un planning'], 403);
            }

            $validated = $request->validate([
                'planning' => 'required|array',
                'planning.*.day_of_week' => 'required|in:lundi,mardi,mercredi,jeudi,vendredi,samedi,dimanche',
                'planning.*.start_time' => 'required|date_format:H:i',
                'planning.*.end_time' => 'required|date_format:H:i|after:planning.*.start_time'
            ]);

            $slots = $this->planningService->createProfessionalPlanning(
                $user->uuid,
                $validated['planning']
            );

            return response()->json($slots, 201);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la création du planning', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la création du planning',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Récupérer tous les plannings (admin)
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role->name !== 'ROLE_ADMIN') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($this->planningService->getAllPlannings());
    }

    // Créer/Mettre à jour le planning (professionnel)
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role->name !== 'ROLE_PRO') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'weekly_appointments' => 'required|array',
            'weekly_appointments.*.day_of_week' => 'required|in:lundi,mardi,mercredi,jeudi,vendredi,samedi,dimanche',
            'weekly_appointments.*.start_time' => 'required|date_format:H:i',
            'weekly_appointments.*.end_time' => 'required|date_format:H:i|after:weekly_appointments.*.start_time'
        ]);

        $planning = $this->planningService->createProfessionalPlanning(
            $user->uuid,
            $validated['weekly_appointments']
        );

        return response()->json($planning, 201);
    }

    // Récupérer le planning d'un professionnel (professionnel connecté)
    public function show(Request $request, $professionalUuid)
    {
        $user = $request->user();

        if ($user->role->name !== 'ROLE_PRO' && $user->role->name !== 'ROLE_ADMIN') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $planning = $this->planningService->getProfessionalPlanning($professionalUuid);

        return response()->json($planning);
    }

    // Récupérer les créneaux disponibles
    public function getAvailableSlots(Request $request, $professionalUuid)
    {
        $validated = $request->validate([
            'date' => 'required|date|after:today'
        ]);

        $slots = $this->planningService->getAvailableSlots(
            $professionalUuid,
            $validated['date']
        );

        return response()->json($slots);
    }

    public function getAllAvailableSlots(Request $request)
    {
        Log::info('Début de la recherche de tous les créneaux disponibles', [
            'user' => Auth::user(),
            'filters' => $request->all()
        ]);

        try {
            $filters = $request->all();
            $availableSlots = $this->planningService->getAllAvailableSlots($filters);

            Log::info('Créneaux disponibles trouvés', [
                'nombre_de_professionnels' => count($availableSlots),
                'details' => $availableSlots
            ]);

            return response()->json($availableSlots);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des créneaux disponibles', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la récupération des créneaux',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function deletePlanning(Request $request, $professionalUuid)
{
    $user = $request->user();

    if ($user->role->name === 'ROLE_PRO' && $user->uuid !== $professionalUuid) {
        return response()->json(['message' => 'Vous ne pouvez supprimer que votre propre planning'], 403);
    }

    if ($user->role->name !== 'ROLE_PRO' && $user->role->name !== 'ROLE_ADMIN') {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    $planning = PlanningAvailability::where('professional_uuid', $professionalUuid)->first();

    if (!$planning) {
        return response()->json(['message' => 'Planning not found'], 404);
    }

    $planning->delete();

    return response()->json(['message' => 'Planning deleted successfully']);
}
}
