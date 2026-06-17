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
        Schema::create('articles_blog', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('titre', 255);
            $table->string('slug', 255)->unique();
            $table->longText('contenu');
            $table->string('extrait', 500)->nullable();
            $table->string('image_couverture', 255)->nullable();
            $table->string('categorie', 255);
            $table->enum('statut', ['brouillon', 'publie'])->default('brouillon');
            $table->unsignedInteger('vues')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles_blog');
    }
};
