<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@agrostock.bj'],
            [
                'nom_complet' => 'Admin AgroStock',
                'telephone' => '0100000000',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'statut' => 'actif',
            ]
        );

        $this->call(CategorieSeeder::class);
    }
}
