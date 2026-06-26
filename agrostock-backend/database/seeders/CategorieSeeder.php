<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorieSeeder extends Seeder
{
    /**
     * Seed toutes les catégories de produits.
     * Utilise insertOrIgnore pour ne pas créer de doublons.
     */
    public function run(): void
    {
        $categories = [
            ['nom' => 'Céréales et farines',    'slug' => 'cereales-et-farines'],
            ['nom' => 'Légumineuses',            'slug' => 'legumineuses'],
            ['nom' => 'Tubercules et racines',   'slug' => 'tubercules-et-racines'],
            ['nom' => 'Oléagineux',              'slug' => 'oleagineux'],
            ['nom' => 'Fruits et légumes',       'slug' => 'fruits-et-legumes'],
            ['nom' => 'Viandes et poissons',     'slug' => 'viandes-et-poissons'],
            ['nom' => 'Épices et condiments',    'slug' => 'epices-et-condiments'],
            ['nom' => 'Produits laitiers',       'slug' => 'produits-laitiers'],
            ['nom' => 'Jus et boisson',          'slug' => 'jus-et-boisson'],
            ['nom' => 'Snack et autres',         'slug' => 'snack-et-autres'],
        ];

        DB::table('categories')->insertOrIgnore($categories);
    }
}
