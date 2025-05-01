<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Role;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CreateAdminUser extends Command
{
    protected $signature = 'admin:create {email} {password} {firstname} {lastname}';
    protected $description = 'Créer un nouvel utilisateur administrateur';

    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');
        $firstname = $this->argument('firstname');
        $lastname = $this->argument('lastname');
        
        // Validation des données
        $validator = Validator::make([
            'email' => $email,
            'password' => $password,
            'firstname' => $firstname,
            'lastname' => $lastname,
        ], [
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
            'firstname' => 'required|string',
            'lastname' => 'required|string',
        ]);
        
        if ($validator->fails()) {
            $this->error('Validation échouée:');
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }
            return 1;
        }
        
        // Vérifier si le rôle administrateur existe
        $adminRole = Role::where('name', 'ROLE_ADMIN')->first();
        if (!$adminRole) {
            $adminRole = Role::create(['name' => 'ROLE_ADMIN']);
            $this->info('Le rôle ROLE_ADMIN a été créé');
        }
        
        // Demander d'autres informations nécessaires
        $birthdate = $this->ask('Date de naissance (YYYY-MM-DD)', '1990-01-01');
        $phone = $this->ask('Numéro de téléphone', '0000000000');
        $address = $this->ask('Adresse', 'Adresse administrateur');
        $zipcode = $this->ask('Code postal', '00000');
        $city = $this->ask('Ville', 'Ville');
        $country = $this->ask('Pays', 'France');
        
        // Créer l'utilisateur administrateur
        $user = User::create([
            'email' => $email,
            'password' => Hash::make($password),
            'firstname' => $firstname,
            'lastname' => $lastname,
            'birthdate' => $birthdate,
            'phone' => $phone,
            'address' => $address,
            'zipcode' => $zipcode,
            'city' => $city,
            'country' => $country,
            'email_verified' => true,
            'role_id' => $adminRole->id,
        ]);
        
        $this->info("Administrateur créé avec succès: {$email}");
        $this->info("UUID: {$user->uuid}");
        
        return 0;
    }
}