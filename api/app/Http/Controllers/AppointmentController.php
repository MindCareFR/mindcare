<?php

namespace App\Http\Controllers;

use App\Services\AppointmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Appointment;
use App\Services\EncryptionService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Validator;
use App\Models\PlanningAvailability;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    protected $appointmentService;

    public function __construct(AppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    // Créer un rendez-vous
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'patient_uuid' => 'required|exists:user_patients,uuid',
            'professional_uuid' => 'required|exists:user_professionals,uuid',
            'start_time' => 'required|date|after:now',
            'end_time' => 'required|date|after:start_time',
        ]);

        try {
            // Vérification des permissions
            if ($user->role->name === 'ROLE_PATIENT' && $request->patient_uuid !== $user->uuid) {
                return response()->json(['message' => 'Vous ne pouvez créer un rendez-vous que pour vous-même'], 403);
            }

            $appointment = $this->appointmentService->createAppointment($validated);

            return response()->json($appointment, 201);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la création du rendez-vous', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }

    // Récupérer les rendez-vous de l'utilisateur
    public function getUserAppointments(Request $request)
    {
        $user = $request->user();

        $filters = $request->only(['status', 'period', 'sort_by', 'sort_direction', 'per_page']);

        $appointments = $this->appointmentService->getUserAppointments($user, $filters);

        return response()->json($appointments);
    }

    // Mettre à jour le statut d'un rendez-vous
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $appointment = Appointment::find($id);

        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        // Vérifier l'autorisation
        if ($user->role->name === 'ROLE_PRO' && $appointment->professional_uuid !== $user->uuid) {
            return response()->json(['message' => 'Unauthorized'], 403);
        } elseif ($user->role->name === 'ROLE_PATIENT' && $appointment->patient_uuid !== $user->uuid) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'start_time' => 'sometimes|date',
            'end_time' => 'sometimes|date|after:start_time',
            'status' => 'sometimes|in:confirmed,canceled,completed',
            'notes' => 'nullable|string',
            'prescription' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Si modification des horaires, vérifier la disponibilité
        if ($request->has('start_time') || $request->has('end_time')) {
            $startTime = $request->input('start_time', $appointment->start_time);
            $endTime = $request->input('end_time', $appointment->end_time);

            // Vérifier la disponibilité du créneau
            $conflictingAppointment = Appointment::where('professional_uuid', $appointment->professional_uuid)
                ->where('id', '!=', $appointment->id) // Exclure le rendez-vous actuel
                ->where(function ($query) use ($startTime, $endTime) {
                    $query->whereBetween('start_time', [$startTime, $endTime])
                        ->orWhereBetween('end_time', [$startTime, $endTime])
                        ->orWhere(function ($q) use ($startTime, $endTime) {
                            $q->where('start_time', '<=', $startTime)
                                ->where('end_time', '>=', $endTime);
                        });
                })
                ->where('status', '!=', 'canceled')
                ->first();

            if ($conflictingAppointment) {
                return response()->json([
                    'message' => 'Ce créneau est déjà réservé',
                    'conflicting_appointment' => $conflictingAppointment
                ], 409);
            }

            // Vérifier que le nouveau créneau correspond aux disponibilités
            $planningAvailability = PlanningAvailability::where('professional_uuid', $appointment->professional_uuid)->first();

            if (!$planningAvailability) {
                return response()->json(['message' => 'Aucun planning disponible pour ce professionnel'], 400);
            }

            $startTimeCarbon = Carbon::parse($startTime);
            $dayOfWeek = $startTimeCarbon->locale('fr')->isoFormat('dddd');

            $matchingSlot = collect($planningAvailability->weekly_appointments)
                ->first(function ($slot) use ($dayOfWeek, $startTimeCarbon) {
                    return $slot['day_of_week'] === $dayOfWeek &&
                        $startTimeCarbon->between(
                            $startTimeCarbon->copy()->setTimeFromTimeString($slot['start_time']),
                            $startTimeCarbon->copy()->setTimeFromTimeString($slot['end_time'])
                        );
                });

            if (!$matchingSlot) {
                return response()->json(['message' => 'Le créneau ne correspond pas aux disponibilités du professionnel'], 400);
            }
        }

        // Restrictions sur les changements de statut
        if ($request->has('status')) {
            if ($user->role->name === 'ROLE_PATIENT') {
                // Un patient ne peut que annuler un rendez-vous
                if ($request->status !== 'canceled') {
                    return response()->json(['message' => 'Vous ne pouvez qu\'annuler un rendez-vous'], 403);
                }
            } elseif ($user->role->name === 'ROLE_PRO') {
                // Un professionnel peut confirmer, annuler, ou marquer comme terminé
                if (!in_array($request->status, ['confirmed', 'canceled', 'completed'])) {
                    return response()->json(['message' => 'Statut non autorisé'], 403);
                }
            }
        }

        // Pour les professionnels, permettre l'ajout de notes et prescription
        if ($user->role->name === 'ROLE_PRO') {
            $updateData = $validator->validated();

            // Ne mettre à jour que les champs fournis
            $appointment->fill($updateData);
            $appointment->save();
        } else {
            // Pour les autres rôles, ne mettre à jour que le statut
            if ($request->has('status')) {
                $appointment->status = $request->status;
                $appointment->save();
            }
        }

        return response()->json($appointment);
    }

    // Récupérer un rendez-vous spécifique
    public function show(Request $request, $id)
    {
        $user = $request->user();
        $appointment = Appointment::with(['professional.user', 'patient.user'])->find($id);

        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }

        // Vérifier l'autorisation
        if ($user->role->name === 'ROLE_PRO' && $appointment->professional_uuid !== $user->uuid) {
            return response()->json(['message' => 'Unauthorized'], 403);
        } elseif ($user->role->name === 'ROLE_PATIENT' && $appointment->patient_uuid !== $user->uuid) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($appointment);
    }

    // Exporter un rendez-vous au format PDF
    public function exportPdf(Request $request, $id)
    {
        try {
            Log::info('Tentative d\'export PDF', [
                'appointment_id' => $id,
                'user' => Auth::user()
            ]);

            $user = $request->user();
            $appointment = Appointment::with(['professional.user', 'patient.user'])->find($id);

            if (!$appointment) {
                Log::error('Rendez-vous non trouvé', ['id' => $id]);
                return response()->json(['message' => 'Appointment not found'], 404);
            }

            // Vérifier l'autorisation
            if ($user->role->name === 'ROLE_ADMIN') {
            } elseif ($user->role->name === 'ROLE_PRO' && $appointment->professional_uuid !== $user->uuid) {
                Log::error('Accès non autorisé pour professionnel', [
                    'user_uuid' => $user->uuid,
                    'professional_uuid' => $appointment->professional_uuid
                ]);
                return response()->json(['message' => 'Unauthorized'], 403);
            } elseif ($user->role->name === 'ROLE_PATIENT' && $appointment->patient_uuid !== $user->uuid) {
                Log::error('Accès non autorisé pour patient', [
                    'user_uuid' => $user->uuid,
                    'patient_uuid' => $appointment->patient_uuid
                ]);
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            // Décrypter les numéros de téléphone avec la méthode decryptData()
            $encryptionService = app(EncryptionService::class);

            if ($appointment->patient && $appointment->patient->user) {
                $appointment->patient->user->decrypted_phone = $encryptionService->decryptData($appointment->patient->user->phone);
            }

            if ($appointment->professional && $appointment->professional->user) {
                $appointment->professional->user->decrypted_phone = $encryptionService->decryptData($appointment->professional->user->phone);
            }

            // Vérifie si le fichier existe
            if (!view()->exists('pdfs.appointment')) {
                Log::error('Vue PDF non trouvée', ['view' => 'pdfs.appointment']);
                return response()->json(['message' => 'Modèle PDF non trouvé'], 500);
            }

            $pdf = Pdf::loadView('pdfs.appointment', ['appointment' => $appointment]);

            return $pdf->download('appointment_' . $appointment->id . '.pdf');
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'export PDF', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de l\'export PDF',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Tous les rdv (Pour le dashboard admin)
    public function getAllAppointments(Request $request)
    {
        $user = $request->user();
        $filters = $request->only(['status', 'period', 'sort_by', 'sort_direction', 'per_page']);

        if ($user->role->name === 'ROLE_ADMIN') {
            $appointments = $this->appointmentService->getAllAppointments($user, $filters);
        } else {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($appointments);
    }
}
