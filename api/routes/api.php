<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DecryptionController;
use App\Http\Controllers\AppointmentController;

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

        Route::prefix('profile')->group(function () {
            Route::get('/me', [ProfileController::class, 'showMe']);
        });
    });
});

Route::middleware('auth:sanctum')->group(function () {
    
    
    Route::prefix('appointments')->group(function () {
        Route::get('/', [AppointmentController::class, 'index']);
        Route::get('/user', [AppointmentController::class, 'getUserAppointments']);
        Route::post('/', [AppointmentController::class, 'store']);
        Route::get('/{id}', [AppointmentController::class, 'show']);
        Route::put('/{id}', [AppointmentController::class, 'update']);
        Route::get('/{id}/export', [AppointmentController::class, 'exportPdf']);
    });

    // Route::post('/admin/create', [AdminController::class, 'createAdmin']);
});

