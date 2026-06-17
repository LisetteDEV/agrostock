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
        Schema::create('avis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('acheteur_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('transformateur_id')->constrained('transformateurs')->onDelete('cascade');
            $table->foreignId('commande_id')->nullable()->constrained('commandes')->nullOnDelete();
            $table->unsignedTinyInteger('note');
            $table->text('commentaire');
            $table->boolean('signale')->default(false);
            $table->enum('statut', ['visible', 'masque'])->default('visible');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['acheteur_id', 'transformateur_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('avis');
    }
};
