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
        Schema::create('commandes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('acheteur_id')->constrained('acheteurs')->onDelete('cascade');
            $table->foreignId('transformateur_id')->constrained('transformateurs')->onDelete('cascade');

            $table->string('numero', 30)->unique()->nullable();
            $table->string('statut', 40)->default('en_attente_confirmation');

            $table->decimal('sous_total', 12, 2)->default(0);
            $table->decimal('frais_livraison', 12, 2)->default(0);
            $table->decimal('commission', 12, 2)->default(0);
            $table->decimal('montant_total', 12, 2)->default(0);

            $table->string('mode_livraison', 50);
            $table->text('adresse_livraison');
            $table->string('ville_livraison', 100);
            $table->string('telephone_livraison', 30);

            $table->string('payment_status', 30)->default('paid');
            $table->string('escrow_status', 30)->default('held');

            $table->timestamp('expires_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('received_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};
