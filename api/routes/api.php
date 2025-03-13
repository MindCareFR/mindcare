<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
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
  });

  // Protected routes
  Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('profile')->group(function () {
      Route::get('/', [ProfileController::class, 'showMyProfile']);
      Route::put('/basic', [ProfileController::class, 'updateBasicInfo']);
      Route::get('/preferences/init', [ProfileController::class, 'initDefaultPreferences']);
      Route::put('/preferences', [ProfileController::class, 'updatePreferences']);
      Route::put('/professional', [ProfileController::class, 'updateProfessionalProfile']);
      Route::put('/patient', [ProfileController::class, 'updatePatientProfile']);
      Route::get('/reviews', [ProfileController::class, 'getMyReviews']);
    });

    Route::post('/professional/{uuid}/review', [ProfileController::class, 'submitReview']);
  });

  Route::get('/profile/{uuid}', [ProfileController::class, 'showPublicProfile']);
});
