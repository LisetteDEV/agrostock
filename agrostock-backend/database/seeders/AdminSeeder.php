<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        User::create([
            'nom_complet' => 'Super Admin',
            'email' => 'admin@agrostock.bj',
            'telephone' => '00000000',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'statut' => 'actif'
        ]);
        
        $this->command->info('Admin créé avec succès.');
    }
}
