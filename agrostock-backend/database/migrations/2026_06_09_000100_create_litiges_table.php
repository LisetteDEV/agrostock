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
        Schema::create('litiges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commande_id')->unique()->constrained('commandes')->onDelete('cascade');
            $table->foreignId('acheteur_id')->constrained('acheteurs')->onDelete('cascade');
            $table->foreignId('transformateur_id')->constrained('transformateurs')->onDelete('cascade');
            $table->unsignedBigInteger('resolved_by')->nullable();

            $table->string('statut', 30)->default('ouvert'); // ouvert, en_cours, resolu_remboursement, resolu_reversement, rejete
            $table->string('motif', 120);
            $table->text('description')->nullable();
            $table->string('resolution_type', 30)->nullable(); // remboursement, reversement, rejet
            $table->text('resolution_note')->nullable();

            $table->timestamp('opened_at')->useCurrent();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['statut', 'opened_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('litiges');
    }
};
