<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->alignCommandesTable();
        $this->alignLigneCommandesTable();
        $this->alignProduitsTable();
        $this->alignAvisTable();
    }

    public function down(): void
    {
        // Non-destructive alignment migration: no automatic rollback.
    }

    private function alignCommandesTable(): void
    {
        if (!Schema::hasTable('commandes')) {
            return;
        }

        Schema::table('commandes', function (Blueprint $table) {
            if (!Schema::hasColumn('commandes', 'numero')) {
                $table->string('numero', 30)->nullable()->after('transformateur_id');
            }
            if (!Schema::hasColumn('commandes', 'sous_total')) {
                $table->decimal('sous_total', 12, 2)->default(0)->after('statut');
            }
            if (!Schema::hasColumn('commandes', 'frais_livraison')) {
                $table->decimal('frais_livraison', 12, 2)->default(0)->after('sous_total');
            }
            if (!Schema::hasColumn('commandes', 'commission')) {
                $table->decimal('commission', 12, 2)->default(0)->after('frais_livraison');
            }
            if (!Schema::hasColumn('commandes', 'payment_status')) {
                $table->string('payment_status', 30)->default('paid')->after('telephone_livraison');
            }
            if (!Schema::hasColumn('commandes', 'escrow_status')) {
                $table->string('escrow_status', 30)->default('held')->after('payment_status');
            }
            if (!Schema::hasColumn('commandes', 'expires_at')) {
                $table->timestamp('expires_at')->nullable()->after('escrow_status');
            }
            if (!Schema::hasColumn('commandes', 'confirmed_at')) {
                $table->timestamp('confirmed_at')->nullable()->after('expires_at');
            }
            if (!Schema::hasColumn('commandes', 'shipped_at')) {
                $table->timestamp('shipped_at')->nullable()->after('confirmed_at');
            }
            if (!Schema::hasColumn('commandes', 'delivered_at')) {
                $table->timestamp('delivered_at')->nullable()->after('shipped_at');
            }
            if (!Schema::hasColumn('commandes', 'received_at')) {
                $table->timestamp('received_at')->nullable()->after('delivered_at');
            }
            if (!Schema::hasColumn('commandes', 'updated_at')) {
                $table->timestamp('updated_at')->nullable()->after('created_at');
            }
        });

        // Make statut flexible for new workflow statuses.
        DB::statement("ALTER TABLE commandes MODIFY COLUMN statut VARCHAR(40) NOT NULL DEFAULT 'en_attente_confirmation'");

        // Map legacy statuses to current workflow values.
        DB::statement("UPDATE commandes SET statut = 'en_attente_confirmation' WHERE statut = 'en_attente'");
        DB::statement("UPDATE commandes SET statut = 'en_cours_livraison' WHERE statut = 'en_cours'");

        // Backfill monetary split if old rows existed.
        DB::statement('UPDATE commandes SET sous_total = montant_total WHERE sous_total = 0 AND montant_total IS NOT NULL');

        if ($this->indexExists('commandes', 'commandes_numero_unique') === false) {
            DB::statement('ALTER TABLE commandes ADD UNIQUE KEY commandes_numero_unique (numero)');
        }
    }

    private function alignLigneCommandesTable(): void
    {
        if (!Schema::hasTable('ligne_commandes')) {
            return;
        }

        Schema::table('ligne_commandes', function (Blueprint $table) {
            if (!Schema::hasColumn('ligne_commandes', 'created_at')) {
                $table->timestamp('created_at')->nullable();
            }
            if (!Schema::hasColumn('ligne_commandes', 'updated_at')) {
                $table->timestamp('updated_at')->nullable();
            }
        });
    }

    private function alignProduitsTable(): void
    {
        if (!Schema::hasTable('produits')) {
            return;
        }

        // The current controller allows nullable categorie_id.
        DB::statement('ALTER TABLE produits MODIFY COLUMN categorie_id BIGINT UNSIGNED NULL');
    }

    private function alignAvisTable(): void
    {
        if (!Schema::hasTable('avis')) {
            return;
        }

        // Move avis.acheteur_id from acheteurs.id to users.id without data loss.
        Schema::table('avis', function (Blueprint $table) {
            if (!Schema::hasColumn('avis', 'acheteur_user_id')) {
                $table->unsignedBigInteger('acheteur_user_id')->nullable()->after('id');
            }
        });

        DB::statement(
            'UPDATE avis a '
            . 'LEFT JOIN acheteurs ac ON ac.id = a.acheteur_id '
            . 'SET a.acheteur_user_id = COALESCE(ac.user_id, a.acheteur_id) '
            . 'WHERE a.acheteur_user_id IS NULL'
        );

        $this->dropForeignKeysForColumn('avis', 'acheteur_id');
        $this->dropIndexIfExists('avis', 'avis_unique');

        if (Schema::hasColumn('avis', 'acheteur_id')) {
            DB::statement('ALTER TABLE avis DROP COLUMN acheteur_id');
        }

        if (Schema::hasColumn('avis', 'acheteur_user_id')) {
            DB::statement('ALTER TABLE avis CHANGE acheteur_user_id acheteur_id BIGINT UNSIGNED NOT NULL');
        }

        if ($this->foreignKeyExists('avis', 'avis_acheteur_id_foreign') === false) {
            DB::statement('ALTER TABLE avis ADD CONSTRAINT avis_acheteur_id_foreign FOREIGN KEY (acheteur_id) REFERENCES users(id) ON DELETE CASCADE');
        }

        $hasDuplicates = (int) DB::table('avis')
            ->selectRaw('COUNT(*) as c')
            ->groupBy('acheteur_id', 'transformateur_id')
            ->havingRaw('COUNT(*) > 1')
            ->count() > 0;

        if ($hasDuplicates === false && $this->indexExists('avis', 'avis_acheteur_transformateur_unique') === false) {
            DB::statement('ALTER TABLE avis ADD UNIQUE KEY avis_acheteur_transformateur_unique (acheteur_id, transformateur_id)');
        }
    }

    private function dropForeignKeysForColumn(string $table, string $column): void
    {
        $keys = DB::select(
            'SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE '
            . 'WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL',
            [$table, $column]
        );

        foreach ($keys as $key) {
            DB::statement("ALTER TABLE {$table} DROP FOREIGN KEY {$key->CONSTRAINT_NAME}");
        }
    }

    private function dropIndexIfExists(string $table, string $indexName): void
    {
        if ($this->indexExists($table, $indexName)) {
            DB::statement("ALTER TABLE {$table} DROP INDEX {$indexName}");
        }
    }

    private function indexExists(string $table, string $indexName): bool
    {
        $rows = DB::select(
            'SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ? LIMIT 1',
            [$table, $indexName]
        );

        return count($rows) > 0;
    }

    private function foreignKeyExists(string $table, string $constraint): bool
    {
        $rows = DB::select(
            'SELECT 1 FROM information_schema.TABLE_CONSTRAINTS '
            . 'WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ? AND CONSTRAINT_TYPE = "FOREIGN KEY" LIMIT 1',
            [$table, $constraint]
        );

        return count($rows) > 0;
    }
};
