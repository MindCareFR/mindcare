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
  });

  // Protected routes
  Route::middleware('auth:sanctum')->group(function () {
    // Add your protected routes here
  });
});
