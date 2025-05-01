<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class AdminRoleSeeder extends Seeder
{
    public function run()
    {
        Role::create([
            'name' => 'ROLE_ADMIN'
        ]);
    }
}