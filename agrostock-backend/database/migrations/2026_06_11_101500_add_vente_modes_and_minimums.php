<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('produits', function (Blueprint $table) {
            if (!Schema::hasColumn('produits', 'mode_vente')) {
                $table->enum('mode_vente', ['gros', 'detail', 'les_deux'])->default('les_deux')->after('prix_gros');
            }

            if (!Schema::hasColumn('produits', 'quantite_min_gros')) {
                $table->unsignedInteger('quantite_min_gros')->default(20)->after('mode_vente');
            }
        });

        Schema::table('commandes', function (Blueprint $table) {
            if (!Schema::hasColumn('commandes', 'mode_achat')) {
                $table->enum('mode_achat', ['gros', 'detail'])->default('detail')->after('montant_total');
            }
        });

        Schema::table('ligne_commandes', function (Blueprint $table) {
            if (!Schema::hasColumn('ligne_commandes', 'mode_achat')) {
                $table->enum('mode_achat', ['gros', 'detail'])->default('detail')->after('quantite');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ligne_commandes', function (Blueprint $table) {
            if (Schema::hasColumn('ligne_commandes', 'mode_achat')) {
                $table->dropColumn('mode_achat');
            }
        });

        Schema::table('commandes', function (Blueprint $table) {
            if (Schema::hasColumn('commandes', 'mode_achat')) {
                $table->dropColumn('mode_achat');
            }
        });

        Schema::table('produits', function (Blueprint $table) {
            if (Schema::hasColumn('produits', 'quantite_min_gros')) {
                $table->dropColumn('quantite_min_gros');
            }

            if (Schema::hasColumn('produits', 'mode_vente')) {
                $table->dropColumn('mode_vente');
            }
        });
    }
};
