<?php

use App\Models\Commande;
use App\Models\Transaction;
use App\Notifications\CommandeStatusNotification;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\DB;

Artisan::command('commandes:expire', function () {
    $expired = Commande::with(['acheteur.user', 'transformateur.user'])
        ->where('statut', 'en_attente_confirmation')
        ->whereNotNull('expires_at')
        ->where('expires_at', '<=', now())
        ->get();

    $count = 0;

    foreach ($expired as $commande) {
        DB::beginTransaction();
        try {
            $commande->statut = 'annulee_auto';
            $commande->payment_status = 'refunded';
            $commande->escrow_status = 'refunded';
            $commande->save();

            $acheteurUserId = $commande->acheteur?->user?->id;
            Transaction::create([
                'commande_id' => $commande->id,
                'from_user_id' => null,
                'to_user_id' => $acheteurUserId,
                'reference' => 'REFUND-' . $commande->id . '-' . now()->format('YmdHis'),
                'type' => 'remboursement',
                'operateur' => null,
                'numero_masked' => null,
                'montant' => $commande->montant_total,
                'statut' => 'succeeded',
                'meta' => ['reason' => 'auto_timeout_24h'],
            ]);

            DB::commit();
            $count++;

            $title = 'Commande annulée automatiquement';
            $message = 'La commande ' . $commande->numero . ' a été annulée automatiquement (absence de confirmation sous 24h). Un remboursement a été déclenché.';

            if ($commande->acheteur?->user) {
                $commande->acheteur->user->notify(new CommandeStatusNotification($commande, $title, $message));
                Log::info('SMS_SIMULATION', [
                    'to' => $commande->acheteur->user->telephone,
                    'message' => $message,
                    'commande' => $commande->numero,
                ]);
            }

            if ($commande->transformateur?->user) {
                $commande->transformateur->user->notify(new CommandeStatusNotification($commande, $title, $message));
                Log::info('SMS_SIMULATION', [
                    'to' => $commande->transformateur->user->telephone,
                    'message' => $message,
                    'commande' => $commande->numero,
                ]);
            }
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('commandes:expire failed', [
                'commande_id' => $commande->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    $this->info('Commandes expirées traitées: ' . $count);
})->purpose('Annule et rembourse les commandes non confirmées après 24h');

Schedule::command('commandes:expire')->everyFiveMinutes();

Artisan::command('inspire', function () {
    $this->comment('Keep building AgroStock 🚀');
})->purpose('Display an inspiring quote');
