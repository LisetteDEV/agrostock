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
        Schema::create('parametres_plateforme', function (Blueprint $table) {
            $table->id();
            $table->decimal('commission_taux', 5, 2)->default(5.00);
            $table->boolean('notification_nouvelle_commande')->default(true);
            $table->boolean('notification_litige')->default(true);
            $table->boolean('notification_paiement')->default(true);
            $table->boolean('notification_email')->default(true);
            $table->boolean('notification_sms')->default(false);
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parametres_plateforme');
    }
};
