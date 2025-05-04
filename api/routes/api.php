<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DecryptionController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ResourceTrackingController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PlanningController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Routes d'authentification
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register/patient', [AuthController::class, 'registerPatient']);
    Route::post('/register/pro', [AuthController::class, 'registerPro']);
    Route::get('/verify', [AuthController::class, 'verify']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    // Routes protégées par authentification
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/renew-password', [AuthController::class, 'renewPassword']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/resource-tracking', [ResourceTrackingController::class, 'trackResourceAccess']);
        Route::get('/users/{userId}/resource-history', [ResourceTrackingController::class, 'getUserResourceHistory']);
        Route::post('/planning', [PlanningController::class, 'setProfessionalPlanning']);
        Route::get('professionals/{professionalUuid}/slots', [PlanningController::class, 'getAvailableSlots']);
        Route::get('professionals/available-slots', [PlanningController::class, 'getAllAvailableSlots']);

        Route::prefix('profile')->group(function () {
            Route::get('/me', [ProfileController::class, 'showMe']);
        });
    });
});

Route::middleware('auth:sanctum')->group(function () {

    Route::prefix('appointments')->group(function () {
        Route::get('/', [AppointmentController::class, 'getAllAppointments']);
        Route::get('/user', [AppointmentController::class, 'getUserAppointments']);
        Route::post('/reserved', [AppointmentController::class, 'store']);
        Route::get('/{id}', [AppointmentController::class, 'show']);
        Route::put('/{id}', [AppointmentController::class, 'update']);
        Route::get('/{id}/export', [AppointmentController::class, 'exportPdf']);
    });

    // Route::post('/admin/create', [AdminController::class, 'createAdmin']);
});
