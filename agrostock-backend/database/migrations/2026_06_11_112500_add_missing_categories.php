<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('categories')->insertOrIgnore([
            ['nom' => 'Produits laitiers', 'slug' => 'produits-laitiers'],
            ['nom' => 'Jus et boisson', 'slug' => 'jus-et-boisson'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('categories')
            ->whereIn('slug', ['produits-laitiers', 'jus-et-boisson'])
            ->delete();
    }
};
