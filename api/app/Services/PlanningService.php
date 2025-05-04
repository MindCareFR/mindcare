<?php

namespace App\Services;

use App\Models\PlanningAvailability;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class PlanningService
{
    // Récupérer tous les plannings (admin)
    public function getAllPlannings()
    {
        return PlanningAvailability::with('professional.user')->get();
    }

    // Créer/Mettre à jour le planning (professionnel)
    public function createProfessionalPlanning($professionalUuid, $weeklyAppointments)
    {
        Log::info('Création de planning pour un professionnel', [
            'professional_uuid' => $professionalUuid,
            'weekly_appointments' => $weeklyAppointments
        ]);

        // Supprime les anciennes disponibilités
        PlanningAvailability::where('professional_uuid', $professionalUuid)->delete();

        // Crée un nouveau planning
        $planning = PlanningAvailability::create([
            'professional_uuid' => $professionalUuid,
            'weekly_appointments' => $weeklyAppointments
        ]);

        Log::info('Planning créé avec succès', [
            'planning_id' => $planning->id
        ]);

        return $planning;
    }
    // Récupérer le planning d'un professionnel
    public function getProfessionalPlanning($professionalUuid)
    {
        return PlanningAvailability::where('professional_uuid', $professionalUuid)->first();
    }

    // Récupérer les créneaux disponibles
    public function getAvailableSlots($professionalUuid, $date)
    {
        $schedule = PlanningAvailability::where('professional_uuid', $professionalUuid)->first();

        if (!$schedule) {
            return [];
        }

        $dayOfWeek = Carbon::parse($date)->locale('fr')->isoFormat('dddd');

        $daySchedule = collect($schedule->weekly_appointments)
            ->firstWhere('day_of_week', $dayOfWeek);

        if (!$daySchedule) {
            return [];
        }

        $existingAppointments = Appointment::where('professional_uuid', $professionalUuid)
            ->whereDate('start_time', $date)
            ->where('status', '!=', 'canceled')
            ->get();

        $availableTimeSlots = [];

        $currentSlot = Carbon::parse($date . ' ' . $daySchedule['start_time']);
        $endTime = Carbon::parse($date . ' ' . $daySchedule['end_time']);

        while ($currentSlot->lt($endTime)) {
            $slotEnd = (clone $currentSlot)->addHour();

            $isSlotFree = $existingAppointments->every(function ($appointment) use ($currentSlot, $slotEnd) {
                $appointmentStart = Carbon::parse($appointment->start_time);
                $appointmentEnd = Carbon::parse($appointment->end_time);

                $overlap = (
                    ($currentSlot >= $appointmentStart && $currentSlot < $appointmentEnd) ||
                    ($slotEnd > $appointmentStart && $slotEnd <= $appointmentEnd) ||
                    ($appointmentStart >= $currentSlot && $appointmentStart < $slotEnd)
                );

                return !$overlap;
            });

            if ($isSlotFree) {
                $availableTimeSlots[] = [
                    'start' => $currentSlot->format('H:i'),
                    'end' => $slotEnd->format('H:i')
                ];
            }

            $currentSlot = $slotEnd;
        }

        return $availableTimeSlots;
    }

    // Récupérer les prochaines dates correspondant à un jour de la semaine
    public function getNextDatesByDayOfWeek($dayOfWeek)
    {
        $nextDates = [];
        $today = Carbon::now();

        for ($i = 0; $i < 7; $i++) {
            $date = $today->copy()->addDays($i);
            if ($date->locale('fr')->isoFormat('dddd') === $dayOfWeek) {
                $nextDates[] = $date->format('Y-m-d');
            }
        }

        return $nextDates;
    }

    public function getAvailableSlotsForDate($professionalUuid, $date, $daySchedule, $existingAppointments)
    {
        $availableTimeSlots = [];
        $currentSlot = Carbon::parse($date . ' ' . $daySchedule['start_time']);
        $endTime = Carbon::parse($date . ' ' . $daySchedule['end_time']);
        while ($currentSlot->lt($endTime)) {
            $slotEnd = (clone $currentSlot)->addHour();

            $isSlotFree = $existingAppointments->every(function ($appointment) use ($currentSlot, $slotEnd) {
                $appointmentStart = Carbon::parse($appointment->start_time);
                $appointmentEnd = Carbon::parse($appointment->end_time);

                $overlap = (
                    ($currentSlot >= $appointmentStart && $currentSlot < $appointmentEnd) ||
                    ($slotEnd > $appointmentStart && $slotEnd <= $appointmentEnd) ||
                    ($appointmentStart >= $currentSlot && $appointmentStart < $slotEnd)
                );

                return !$overlap;
            });

            if ($isSlotFree) {
                $availableTimeSlots[] = [
                    'start' => $currentSlot->format('H:i'),
                    'end' => $slotEnd->format('H:i')
                ];
            }

            $currentSlot = $slotEnd;
        }
        return $availableTimeSlots;
    }
    public function getAllAvailableSlots($filters = [])
    {
        Log::info('Récupération de tous les plannings', [
            'filters' => $filters
        ]);

        $query = PlanningAvailability::query();

        // Filtres optionnels
        if (isset($filters['professional_uuid'])) {
            $query->where('professional_uuid', $filters['professional_uuid']);
        }

        $schedules = $query->get();

        Log::info('Nombre de plannings trouvés', [
            'nombre' => $schedules->count()
        ]);

        $allAvailableSlots = [];

        foreach ($schedules as $schedule) {
            $professionalSlots = [];

            // Parcourir tous les créneaux du planning
            foreach ($schedule->weekly_appointments as $daySchedule) {
                // Trouver les prochaines dates correspondant au jour de la semaine
                $nextDates = $this->getNextDatesByDayOfWeek($daySchedule['day_of_week']);

                foreach ($nextDates as $date) {
                    $existingAppointments = Appointment::where('professional_uuid', $schedule->professional_uuid)
                        ->whereDate('start_time', $date)
                        ->where('status', '!=', 'canceled')
                        ->get();

                    Log::info('Vérification des créneaux pour une date', [
                        'professional_uuid' => $schedule->professional_uuid,
                        'date' => $date,
                        'nombre_rendez_vous' => $existingAppointments->count()
                    ]);

                    $availableSlots = $this->getAvailableSlotsForDate(
                        $schedule->professional_uuid,
                        $date,
                        $daySchedule,
                        $existingAppointments
                    );

                    if (!empty($availableSlots)) {
                        $professionalSlots[] = [
                            'day_of_week' => $daySchedule['day_of_week'],
                            'date' => $date,
                            'slots' => $availableSlots
                        ];
                    }
                }
            }

            if (!empty($professionalSlots)) {
                $allAvailableSlots[] = [
                    'professional_uuid' => $schedule->professional_uuid,
                    'available_slots' => $professionalSlots
                ];
            }
        }

        Log::info('Résultat final des créneaux disponibles', [
            'nombre_de_professionnels' => count($allAvailableSlots)
        ]);

        // Trier par date
        usort($allAvailableSlots, function ($a, $b) {
            return strtotime($a['available_slots'][0]['date']) - strtotime($b['available_slots'][0]['date']);
        });

        return $allAvailableSlots;
    }
}
