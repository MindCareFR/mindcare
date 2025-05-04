<?php

namespace App\Services;

use App\Models\ResourceTracking;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use App\Models\Appointment;

class ResourceTrackingService
{
    public function getUserResourceHistory(User $requestingUser, User $targetUser, $filters = [])
    {
        // Vérifier les permissions d'accès
        $this->authorizeHistoryAccess($requestingUser, $targetUser);

        $query = ResourceTracking::where('user_uuid', $targetUser->uuid);

        // Filtres optionnels
        if (isset($filters['resource_type'])) {
            $query->where('resource_type', $filters['resource_type']);
        }

        if (isset($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        // Filtres de date
        if (isset($filters['start_date'])) {
            $query->where('created_at', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->where('created_at', '<=', $filters['end_date']);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    private function authorizeHistoryAccess(User $requestingUser, User $targetUser)
{
    // Admin peut tout voir
    if ($requestingUser->hasRole('admin')) {
        return true;
    }

    // Le patient ne peut voir que son propre historique
    if ($requestingUser->hasRole('patient')) {
        if ($requestingUser->uuid !== $targetUser->uuid) {
            throw new AuthorizationException('Vous ne pouvez consulter que votre propre historique.');
        }
        return true;
    }

    // Professionnel : peut voir l'historique uniquement des patients avec lesquels il a eu un rendez-vous
    if ($requestingUser->hasRole('professional')) {
        // Vérifier s'il y a eu des rendez-vous entre le professionnel et le patient
        $hasAppointments = Appointment::where(function($query) use ($requestingUser, $targetUser) {
            $query->where('professional_uuid', $requestingUser->uuid)
                  ->where('patient_uuid', $targetUser->uuid);
        })->exists();

        if (!$hasAppointments) {
            throw new AuthorizationException('Vous ne pouvez consulter que l\'historique des patients avec lesquels vous avez eu des rendez-vous.');
        }
        return true;
    }

    throw new AuthorizationException('Accès non autorisé.');
}

    public function trackResourceAccess($resource, User $user, string $action, array $metadata = [], ?int $duration = null)
    {
        return ResourceTracking::create([
            'user_uuid' => $user->uuid,
            'resource_type' => get_class($resource),
            'resource_id' => $resource->id,
            'action' => $action,
            'duration' => $duration,
            'metadata' => $metadata
        ]);
    }
}