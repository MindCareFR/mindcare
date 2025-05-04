<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\PlanningAvailability;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use App\Services\PlanningService;


class AppointmentService
{
    // Réserver un créneau (tous rôles)
    public function createAppointment($data)
    {
        // Vérifier la disponibilité du créneau
        $conflictingAppointment = Appointment::where('professional_uuid', $data['professional_uuid'])
            ->where(function ($query) use ($data) {
                $query->whereBetween('start_time', [$data['start_time'], $data['end_time']])
                    ->orWhereBetween('end_time', [$data['start_time'], $data['end_time']])
                    ->orWhere(function ($q) use ($data) {
                        $q->where('start_time', '<=', $data['start_time'])
                            ->where('end_time', '>=', $data['end_time']);
                    });
            })
            ->where('status', '!=', 'canceled')
            ->first();

        if ($conflictingAppointment) {
            throw new \Exception('Ce créneau est déjà réservé');
        }

        // Vérifier que le créneau correspond au planning du professionnel
        $planningAvailability = PlanningAvailability::where('professional_uuid', $data['professional_uuid'])->first();

        if (!$planningAvailability) {
            throw new \Exception('Aucun planning disponible pour ce professionnel');
        }

        $startTime = Carbon::parse($data['start_time']);
        $dayOfWeek = $startTime->locale('fr')->isoFormat('dddd');

        $matchingSlot = collect($planningAvailability->weekly_appointments)
            ->first(function ($slot) use ($dayOfWeek, $startTime) {
                return $slot['day_of_week'] === $dayOfWeek &&
                    $startTime->between(
                        $startTime->copy()->setTimeFromTimeString($slot['start_time']),
                        $startTime->copy()->setTimeFromTimeString($slot['end_time'])
                    );
            });

        if (!$matchingSlot) {
            throw new \Exception('Le créneau ne correspond pas aux disponibilités du professionnel');
        }

        // Créer le rendez-vous
        return Appointment::create([
            'patient_uuid' => $data['patient_uuid'],
            'professional_uuid' => $data['professional_uuid'],
            'start_time' => $data['start_time'],
            'end_time' => $data['end_time'],
            'status' => 'confirmed',
        ]);
    }

    // Récupérer les rendez-vous disponibles (non réservés)
    public function getAvailableAppointments($professionalUuid, $date)
    {
        $planningService = new PlanningService();
        return $planningService->getAvailableSlots($professionalUuid, $date);
    }

    // Récupérer les rendez-vous de l'utilisateur connecté
    public function getUserAppointments($user, $filters = [])
    {
        $query = Appointment::query();

        // Filtrer par rôle
        if ($user->role->name === 'ROLE_PRO') {
            $query->where('professional_uuid', $user->uuid);
        } elseif ($user->role->name === 'ROLE_PATIENT') {
            $query->where('patient_uuid', $user->uuid);
        }

        // Filtres supplémentaires
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['period'])) {
            switch ($filters['period']) {
                case 'past':
                    $query->past();
                    break;
                case 'upcoming':
                    $query->upcoming();
                    break;
            }
        }

        // Tri
        $query->orderBy($filters['sort_by'] ?? 'start_time', $filters['sort_direction'] ?? 'asc');

        return $query->with(['professional.user', 'patient.user'])->paginate($filters['per_page'] ?? 10);
    }

    // Mettre à jour le statut d'un rendez-vous
    public function updateAppointmentStatus($appointment, $user, $newStatus)
    {
        // Vérifications de permission
        if ($user->role->name === 'ROLE_PATIENT' && $newStatus !== 'canceled') {
            throw new \Exception('Vous ne pouvez qu\'annuler un rendez-vous');
        }

        if ($user->role->name === 'ROLE_PRO' && !in_array($newStatus, ['confirmed', 'canceled', 'completed'])) {
            throw new \Exception('Statut non autorisé');
        }

        $appointment->update(['status' => $newStatus]);
        return $appointment;
    }

    public function updateAppointment($appointment, $user, $data)
    {
        // Vérifications de permission
        if ($user->role->name === 'ROLE_PATIENT' && $appointment->patient_uuid !== $user->uuid) {
            throw new \Exception('Vous ne pouvez modifier que vos propres rendez-vous');
        }

        if ($user->role->name === 'ROLE_PRO' && $appointment->professional_uuid !== $user->uuid) {
            throw new \Exception('Vous ne pouvez modifier que vos propres rendez-vous');
        }

        // Vérification et validation des données
        $validator = Validator::make($data, [
            'start_time' => 'sometimes|date',
            'end_time' => 'sometimes|date|after:start_time',
            'status' => 'sometimes|in:confirmed,canceled,completed',
            'notes' => 'nullable|string',
            'prescription' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            throw new \Exception($validator->errors()->first());
        }

        // Restrictions sur le statut
        if (isset($data['status'])) {
            if ($user->role->name === 'ROLE_PATIENT') {
                // Un patient ne peut que annuler
                if ($data['status'] !== 'canceled') {
                    throw new \Exception('Vous ne pouvez qu\'annuler un rendez-vous');
                }
            } elseif ($user->role->name === 'ROLE_PRO') {
                // Un professionnel peut confirmer, annuler, ou marquer comme terminé
                if (!in_array($data['status'], ['confirmed', 'canceled', 'completed'])) {
                    throw new \Exception('Statut non autorisé');
                }
            }
        }

        // Vérification de disponibilité si modification des horaires
        if (isset($data['start_time']) || isset($data['end_time'])) {
            $startTime = $data['start_time'] ?? $appointment->start_time;
            $endTime = $data['end_time'] ?? $appointment->end_time;

            // Logique de vérification de disponibilité similaire à celle du contrôleur
            $conflictingAppointment = Appointment::where('professional_uuid', $appointment->professional_uuid)
                ->where('id', '!=', $appointment->id)
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
                throw new \Exception('Ce créneau est déjà réservé');
            }
        }

        // Mise à jour
        if ($user->role->name === 'ROLE_PRO') {
            // Le professionnel peut mettre à jour plus d'informations
            $appointment->fill($data);
        } else {
            // Autres rôles ne peuvent modifier que certains champs
            if (isset($data['status'])) {
                $appointment->status = $data['status'];
            }
        }

        $appointment->save();
        return $appointment;
    }

    //all appointments
    public function getAllAppointments($user, $filters = [])
    {
        if ($user->role->name === 'ROLE_ADMIN') {
            $query = Appointment::query();
        } else {
            // Si l'utilisateur n'est pas admin, on filtre par son UUID
            $query = Appointment::where('professional_uuid', $user->uuid);
        }
        $query = Appointment::query();

        // Filtres supplémentaires
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['period'])) {
            switch ($filters['period']) {
                case 'past':
                    $query->past();
                    break;
                case 'upcoming':
                    $query->upcoming();
                    break;
            }
        }

        // Tri
        $query->orderBy($filters['sort_by'] ?? 'start_time', $filters['sort_direction'] ?? 'asc');

        return $query->with(['professional.user', 'patient.user'])->paginate($filters['per_page'] ?? 10);
    }
}
