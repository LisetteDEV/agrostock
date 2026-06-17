<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('articles_blog') || !Schema::hasColumn('articles_blog', 'categorie')) {
            return;
        }

        $driver = DB::getDriverName();

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE articles_blog MODIFY COLUMN categorie VARCHAR(255) NOT NULL');
        } elseif ($driver === 'pgsql') {
            DB::statement('ALTER TABLE articles_blog ALTER COLUMN categorie TYPE VARCHAR(255)');
        }
    }

    public function down(): void
    {
        // Non-destructive schema alignment: no rollback.
    }
};
