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
        Schema::table('acheteurs', function (Blueprint $table) {
            if (!Schema::hasColumn('acheteurs', 'points_fidelite')) {
                $table->unsignedInteger('points_fidelite')->default(0)->after('commune');
            }

            if (!Schema::hasColumn('acheteurs', 'credit_remise')) {
                $table->decimal('credit_remise', 12, 2)->default(0)->after('points_fidelite');
            }
        });

        Schema::table('commandes', function (Blueprint $table) {
            if (!Schema::hasColumn('commandes', 'logistique_mode')) {
                $table->enum('logistique_mode', ['gozem', 'livreur_propre'])->default('gozem')->after('mode_livraison');
            }

            if (!Schema::hasColumn('commandes', 'remise_appliquee')) {
                $table->decimal('remise_appliquee', 12, 2)->default(0)->after('commission');
            }

            if (!Schema::hasColumn('commandes', 'commission_rate')) {
                $table->decimal('commission_rate', 5, 2)->default(10)->after('commission');
            }
        });

        if (!Schema::hasTable('bons_retraits')) {
            Schema::create('bons_retraits', function (Blueprint $table) {
                $table->id();
                $table->foreignId('commande_id')->unique()->constrained('commandes')->cascadeOnDelete();
                $table->string('code', 40)->unique();
                $table->string('otp_code', 10);
                $table->timestamp('otp_expires_at')->nullable();
                $table->timestamp('validated_at')->nullable();
                $table->string('zone_retrait', 180)->nullable();
                $table->string('gps_link', 255)->nullable();
                $table->text('instructions')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('bons_retraits')) {
            Schema::dropIfExists('bons_retraits');
        }

        Schema::table('commandes', function (Blueprint $table) {
            foreach (['logistique_mode', 'remise_appliquee', 'commission_rate'] as $column) {
                if (Schema::hasColumn('commandes', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('acheteurs', function (Blueprint $table) {
            foreach (['points_fidelite', 'credit_remise'] as $column) {
                if (Schema::hasColumn('acheteurs', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
