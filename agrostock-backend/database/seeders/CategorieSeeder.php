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
            ['nom' => 'Céréales et farines',                   'slug' => 'cereales-et-farines'],
            ['nom' => 'Tubercules transformés',                'slug' => 'tubercules-transformes'],
            ['nom' => 'Fruits et légumes transformés',         'slug' => 'fruits-et-legumes-transformes'],
            ['nom' => 'Jus et boissons naturelles',            'slug' => 'jus-et-boissons-naturelles'],
            ['nom' => 'Huiles alimentaires',                   'slug' => 'huiles-alimentaires'],
            ['nom' => 'Épices et condiments',                  'slug' => 'epices-et-condiments'],
            ['nom' => 'Produits laitiers',                     'slug' => 'produits-laitiers'],
            ['nom' => 'Produits carnés et halieutiques',       'slug' => 'produits-carnes-et-halieutiques'],
            ['nom' => 'Snacks et produits sucrés',             'slug' => 'snacks-et-produits-sucres'],
            ['nom' => 'Conserves et produits fermentés',       'slug' => 'conserves-et-produits-fermentes'],
        ];

        DB::table('categories')->insertOrIgnore($categories);
    }
}
