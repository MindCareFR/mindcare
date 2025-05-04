<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    /**
     * Créer un utilisateur administrateur
     */
    public function createAdmin(Request $request)
    {
        
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
            'firstname' => 'required|string',
            'lastname' => 'required|string',
            'birthdate' => 'required|date',
            'phone' => 'required|string',
            'address' => 'required|string',
            'address_complement' => 'nullable|string',
            'zipcode' => 'required|string',
            'city' => 'required|string',
            'country' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Vérifier si le rôle ROLE_ADMIN existe, sinon le créer
            $adminRole = Role::where('name', 'ROLE_ADMIN')->first();
            if (!$adminRole) {
                $adminRole = Role::create(['name' => 'ROLE_ADMIN']);
                Log::info('Rôle ROLE_ADMIN créé');
            }

            // Créer l'utilisateur administrateur
            $userData = $validator->validated();
            $userData['email_verified'] = true;
            $userData['role_id'] = $adminRole->id;
            $userData['password'] = Hash::make($userData['password']);

            $user = User::create($userData);

            Log::info('Administrateur créé avec succès', ['email' => $user->email]);

            return response()->json([
                'message' => 'Administrateur créé avec succès',
                'user' => [
                    'uuid' => $user->uuid,
                    'email' => $user->email,
                    'firstname' => $user->firstname,
                    'lastname' => $user->lastname,
                    'role' => 'ROLE_ADMIN'
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la création de l\'administrateur', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Une erreur est survenue lors de la création de l\'administrateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}