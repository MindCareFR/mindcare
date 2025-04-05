<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Response;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::middleware('api')->group(function () {
    Route::get('/', function () {
        return response()->json(['message' => 'API is working!']);
    });

    Route::prefix('auth')->group(function () {
        Route::post('/register/patient', [AuthController::class, 'registerPatient']);
        Route::post('/register/pro', [AuthController::class, 'registerPro']);
        Route::post('/login', [AuthController::class, 'login']);
        Route::get('/verify', [AuthController::class, 'verify']);

        // Route protégée pour le profil utilisateur
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/user-profile', [AuthController::class, 'userProfile']);
        });
    });

    // Autres routes protégées
    Route::middleware('auth:sanctum')->group(function () {
        // Ajoutez vos autres routes protégées ici
    });
});
