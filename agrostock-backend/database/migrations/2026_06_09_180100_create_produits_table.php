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
        Schema::create('produits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transformateur_id')->constrained('transformateurs')->onDelete('cascade');
            $table->foreignId('categorie_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('nom', 255);
            $table->text('description')->nullable();
            $table->decimal('prix_unitaire', 12, 2);
            $table->decimal('prix_gros', 12, 2)->nullable();
            $table->integer('stock')->default(0);
            $table->string('unite_mesure', 50)->default('kg');
            $table->integer('delai_livraison')->nullable();
            $table->json('photos')->nullable();
            $table->enum('statut', ['actif', 'en_attente', 'rejete', 'epuise'])->default('actif');
            $table->timestamps();

            $table->index(['transformateur_id', 'statut']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produits');
    }
};
