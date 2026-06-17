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
        Schema::create('transformateurs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->string('nom_entreprise', 150);
            $table->string('logo', 255)->nullable();
            $table->enum('type_entreprise', ['pme', 'cooperative', 'artisan']);
            $table->text('description')->nullable();
            $table->string('numero_ifu', 50)->nullable();
            $table->string('departement', 100);
            $table->string('commune', 100);
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->enum('mode_vente', ['gros', 'detail', 'les_deux'])->default('les_deux');
            $table->integer('quantite_min_commande')->default(1);
            $table->string('piece_identite', 255)->nullable();
            $table->string('registre_commerce', 255)->nullable();
            $table->string('photo_atelier', 255)->nullable();
            $table->enum('statut_verification', ['en_attente', 'verifie', 'rejete'])->default('en_attente');
            $table->text('motif_rejet')->nullable();
            $table->unsignedBigInteger('verifie_par')->nullable();
            $table->timestamp('verifie_le')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transformateurs');
    }
};
