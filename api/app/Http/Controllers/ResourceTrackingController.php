<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\ResourceTrackingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class ResourceTrackingController extends Controller
{
    protected $resourceTrackingService;

    public function __construct(ResourceTrackingService $resourceTrackingService)
    {
        $this->resourceTrackingService = $resourceTrackingService;
    }

    public function getUserResourceHistory(Request $request, $userId)
    {
        $requestingUser = Auth::user();
        $targetUser = User::findOrFail($userId);

        $validated = $request->validate([
            'resource_type' => 'nullable|string',
            'action' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date'
        ]);

        $history = $this->resourceTrackingService->getUserResourceHistory(
            $requestingUser, 
            $targetUser,
            $validated
        );

        return response()->json($history);
    }

    public function trackResourceAccess(Request $request)
    {
        $validated = $request->validate([
            'resource_type' => 'required|string',
            'resource_id' => 'required|uuid',
            'action' => 'nullable|string',
            'duration' => 'nullable|integer',
            'metadata' => 'nullable|array'
        ]);

        $user = Auth::user();

        // Récupérer la ressource dynamiquement
        $resourceClass = $validated['resource_type'];
        $resource = $resourceClass::findOrFail($validated['resource_id']);

        $tracking = $this->resourceTrackingService->trackResourceAccess(
            $resource, 
            $user,
            $validated['action'] ?? 'view',
            $validated['metadata'] ?? [],
            $validated['duration'] ?? null
        );

        return response()->json($tracking);
    }
}