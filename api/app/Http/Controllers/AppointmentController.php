<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Services\EncryptionService;

class AppointmentController extends Controller
{
    /**
 * Récupérer tous les rendez-vous (réservé aux administrateurs)
 */
public function index(Request $request)
{
    $user = $request->user();
    
    // Vérifier si l'utilisateur est un administrateur
    if ($user->role->name !== 'ROLE_ADMIN') {
        return response()->json(['message' => 'Unauthorized. Only administrators can access this resource.'], 403);
    }
    
    $query = Appointment::query();
    
    // Filtrage par professionnel si fourni
    if ($request->has('professional_uuid')) {
        $query->where('professional_uuid', $request->professional_uuid);
    }
    
    // Filtrage par patient si fourni
    if ($request->has('patient_uuid')) {
        $query->where('patient_uuid', $request->patient_uuid);
    }
    
    // Filtrage par statut si fourni
    if ($request->has('status')) {
        $query->where('status', $request->status);
    }
    
    // Filtrage par date (passés ou à venir)
    if ($request->has('period')) {
        if ($request->period === 'past') {
            $query->where('end_time', '<', now());
        } elseif ($request->period === 'upcoming') {
            $query->where('start_time', '>', now());
        }
    }
    
    // Filtrage par date de début
    if ($request->has('start_date')) {
        $query->where('start_time', '>=', $request->start_date);
    }
    
    // Filtrage par date de fin
    if ($request->has('end_date')) {
        $query->where('end_time', '<=', $request->end_date);
    }
    
    // Tri
    $sortBy = $request->input('sort_by', 'start_time');
    $sortDirection = $request->input('sort_direction', 'asc');
    $query->orderBy($sortBy, $sortDirection);
    
    // Chargement des relations
    $query->with(['professional.user', 'patient.user']);
    
    // Pagination avec nombre personnalisable d'éléments par page
    $perPage = $request->input('per_page', 10);
    $appointments = $query->paginate($perPage);
    
    return response()->json($appointments);
}

    /**
 * Récupérer tous les rendez-vous de l'utilisateur connecté
 */
public function getUserAppointments(Request $request)
{
    $user = $request->user();
    $query = Appointment::query();
    
    // Récupérer les rendez-vous en fonction du rôle
    if ($user->role->name === 'ROLE_PRO') {
        $query->where('professional_uuid', $user->uuid);
    } elseif ($user->role->name === 'ROLE_PATIENT') {
        $query->where('patient_uuid', $user->uuid);
    } else {
        return response()->json(['message' => 'Unauthorized'], 403);
    }
    
    // Appliquer les filtres supplémentaires si nécessaire
    if ($request->has('status')) {
        $query->where('status', $request->status);
    }
    
    // Filtrage par période (passés ou à venir)
    if ($request->has('period')) {
        if ($request->period === 'past') {
            $query->where('end_time', '<', now());
        } elseif ($request->period === 'upcoming') {
            $query->where('start_time', '>', now());
        }
    }
    
    // Trier par date par défaut
    $sortDirection = $request->input('sort_direction', 'asc');
    $query->orderBy('start_time', $sortDirection);
    
    // Charger les données des utilisateurs associés
    $query->with(['professional.user', 'patient.user']);
    
    // Pagination des résultats
    $perPage = $request->input('per_page', 10);
    $appointments = $query->paginate($perPage);
    
    return response()->json($appointments);
}
    // Créer un rendez-vous
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'patient_uuid' => 'required|exists:user_patients,uuid',
                'professional_uuid' => 'required|exists:user_professionals,uuid',
                'start_time' => 'required|date',
                'end_time' => 'required|date|after:start_time',
            ]);
    
            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }
    
            $appointment = Appointment::create([
                'patient_uuid' => $request->patient_uuid,
                'professional_uuid' => $request->professional_uuid,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'status' => 'pending',
            ]);
    
            return response()->json($appointment, 201);
        } catch (\Exception $e) {
            // Log l'erreur pour le debug
            Log::error('Erreur lors de la création du rendez-vous', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Une erreur est survenue lors de la création du rendez-vous',
                'error' => $e->getMessage()
            ], 500);
        }
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

    // Mettre à jour un rendez-vous
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
            'status' => 'sometimes|in:pending,confirmed,canceled,completed',
            'notes' => 'sometimes|nullable|string',
            'prescription' => 'sometimes|nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        
        $appointment->update($validator->validated());
        
        return response()->json($appointment);
    }

    public function exportPdf(Request $request, $id)
    {
        $user = $request->user();
        $appointment = Appointment::with(['professional.user', 'patient.user'])->find($id);
        
        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found'], 404);
        }
        
        // Vérifier l'autorisation
        if ($user->role->name === 'ROLE_ADMIN') {
            // L'administrateur a accès à tous les rendez-vous
        } elseif ($user->role->name === 'ROLE_PRO' && $appointment->professional_uuid !== $user->uuid) {
            return response()->json(['message' => 'Unauthorized'], 403);
        } elseif ($user->role->name === 'ROLE_PATIENT' && $appointment->patient_uuid !== $user->uuid) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        try {
            // Déchiffrer les numéros de téléphone avec la méthode decryptData()
            $encryptionService = app(EncryptionService::class);
            
            if ($appointment->patient && $appointment->patient->user) {
                $appointment->patient->user->decrypted_phone = $encryptionService->decryptData($appointment->patient->user->phone);
            }
            
            if ($appointment->professional && $appointment->professional->user) {
                $appointment->professional->user->decrypted_phone = $encryptionService->decryptData($appointment->professional->user->phone);
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
}