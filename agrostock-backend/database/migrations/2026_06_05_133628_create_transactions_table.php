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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commande_id')->nullable()->constrained('commandes')->nullOnDelete();
            $table->foreignId('from_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('to_user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('reference', 80)->unique();
            $table->string('type', 30); // paiement, reversement, remboursement, commission
            $table->string('operateur', 30)->nullable();
            $table->string('numero_masked', 40)->nullable();
            $table->decimal('montant', 12, 2);
            $table->string('statut', 30)->default('succeeded');
            $table->json('meta')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
