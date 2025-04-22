<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DecryptionController;

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
    Route::get('/verify/{token}', [AuthController::class, 'verify']);

    // Routes protégées par authentification
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user-profile', [AuthController::class, 'userProfile']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

// Route de déchiffrement (protégée par authentification)
Route::middleware('auth:sanctum')->post('/decrypt', [DecryptionController::class, 'decrypt']);

// Routes de profil protégées par authentification
Route::middleware('auth:sanctum')->prefix('profile')->group(function () {
    // Informations de base
    Route::get('/', [ProfileController::class, 'show']);
    Route::put('/basic', [ProfileController::class, 'updateBasicInfo']);

    // Routes spécifiques patient
    Route::get('/patient/{uuid}', [ProfileController::class, 'showPatientDetails']);
    Route::put('/patient', [ProfileController::class, 'updatePatientProfile']);

    // Routes spécifiques professionnel
    Route::get('/professional/{uuid}', [ProfileController::class, 'showProfessionalDetails']);
    Route::put('/professional', [ProfileController::class, 'updateProfessionalProfile']);

    // Avis et évaluations
    Route::get('/reviews', [ProfileController::class, 'getReviews']);
    Route::post('/professional/{uuid}/review', [ProfileController::class, 'submitReview']);

    // Préférences
    Route::get('/preferences/init', [ProfileController::class, 'initPreferences']);
    Route::put('/preferences', [ProfileController::class, 'updatePreferences']);

    // Mode anonyme
    Route::post('/toggle-anonymous', [ProfileController::class, 'toggleAnonymousMode']);
});

// Profil public
Route::get('/profile/{uuid}', [ProfileController::class, 'showPublic']);
