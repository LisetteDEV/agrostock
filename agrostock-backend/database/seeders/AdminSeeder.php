<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminSeeder extends Seeder
{
    public function run()
    {
        User::updateOrCreate(
            ['email' => 'admin@agrostock.bj'],
            [
                'nom_complet' => 'Super Admin',
                'telephone' => '00000000',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'statut' => 'actif',
            ]
        );

        $this->command->info('Admin créé avec succès.');
    }
}