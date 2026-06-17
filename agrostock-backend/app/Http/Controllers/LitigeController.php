<?php

namespace App\Http\Controllers;

use App\Models\Acheteur;
use App\Models\Commande;
use App\Models\Litige;
use App\Models\Portefeuille;
use App\Models\Transaction;
use App\Notifications\CommandeStatusNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LitigeController extends Controller
{
    public function ouvrir(Request $request, $commandeId)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'acheteur') {
            return response()->json(['message' => 'RÃƒÂ©servÃƒÂ© aux acheteurs'], 403);
        }

        $acheteur = Acheteur::where('user_id', $user->id)->first();
        if (!$acheteur) {
            return response()->json(['message' => 'Profil acheteur introuvable'], 404);
        }

        $request->validate([
            'motif' => 'required|string|max:120',
            'description' => 'nullable|string|max:2000',
        ]);

        $commande = Commande::with(['transformateur.user', 'acheteur.user'])
            ->where('id', $commandeId)
            ->where('acheteur_id', $acheteur->id)
            ->first();

        if (!$commande) {
            return response()->json(['message' => 'Commande introuvable'], 404);
        }

        if (in_array($commande->statut, ['recue', 'annulee_auto', 'remboursee'], true)) {
            return response()->json(['message' => 'Cette commande ne peut plus faire lÃ¢â‚¬â„¢objet dÃ¢â‚¬â„¢un litige.'], 422);
        }

        if (Litige::where('commande_id', $commande->id)->exists()) {
            return response()->json(['message' => 'Un litige existe dÃƒÂ©jÃƒÂ  pour cette commande.'], 409);
        }

        $litige = Litige::create([
            'commande_id' => $commande->id,
            'acheteur_id' => $commande->acheteur_id,
            'transformateur_id' => $commande->transformateur_id,
            'statut' => 'ouvert',
            'motif' => $request->motif,
            'description' => $request->description,
            'opened_at' => now(),
        ]);

        $commande->statut = 'litige_ouvert';
        $commande->save();

        $title = 'Litige ouvert';
        $message = 'Un litige a ÃƒÂ©tÃƒÂ© ouvert pour la commande ' . $commande->numero . '. LÃ¢â‚¬â„¢administration va examiner le dossier.';

        if ($commande->acheteur?->user) {
            $commande->acheteur->user->notify(new CommandeStatusNotification($commande, $title, $message));
        }

        if ($commande->transformateur?->user) {
            $commande->transformateur->user->notify(new CommandeStatusNotification($commande, $title, $message));
        }

        Log::info('LITIGE_OUVERT', [
            'commande_id' => $commande->id,
            'litige_id' => $litige->id,
            'motif' => $litige->motif,
        ]);

        return response()->json([
            'message' => 'Litige ouvert avec succÃƒÂ¨s.',
            'litige' => [
                'id' => $litige->id,
                'statut' => $litige->statut,
                'motif' => $litige->motif,
            ],
        ], 201);
    }

    public function adminIndex()
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'RÃƒÂ©servÃƒÂ© aux administrateurs'], 403);
        }

        $litiges = Litige::with([
            'commande',
            'commande.acheteur.user',
            'commande.transformateur.user',
            'resolvedByUser',
        ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Litige $l) {
                return [
                    'id' => $l->id,
                    'statut' => $l->statut,
                    'motif' => $l->motif,
                    'description' => $l->description,
                    'resolution_type' => $l->resolution_type,
                    'resolution_note' => $l->resolution_note,
                    'opened_at' => $l->opened_at,
                    'resolved_at' => $l->resolved_at,
                    'resolved_by' => $l->resolvedByUser?->nom_complet,
                    'commande' => [
                        'id' => $l->commande?->id,
                        'numero' => $l->commande?->numero,
                        'statut' => $l->commande?->statut,
                        'montant_total' => $l->commande?->montant_total,
                    ],
                    'acheteur' => $l->commande?->acheteur?->user?->nom_complet,
                    'transformateur' => $l->commande?->transformateur?->nom_entreprise,
                ];
            });

        return response()->json(['litiges' => $litiges]);
    }

    public function adminResolve(Request $request, $litigeId)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'RÃƒÂ©servÃƒÂ© aux administrateurs'], 403);
        }

        $request->validate([
            'decision' => 'required|in:remboursement,reversement,rejet',
            'note' => 'nullable|string|max:2000',
        ]);

        $litige = Litige::with([
            'commande',
            'commande.acheteur.user',
            'commande.transformateur.user',
            'commande.transformateur',
            'commande.bonRetrait',
        ])->find($litigeId);

        if (!$litige) {
            return response()->json(['message' => 'Litige introuvable'], 404);
        }

        if (!in_array($litige->statut, ['ouvert', 'en_cours'], true)) {
            return response()->json(['message' => 'Ce litige a dÃƒÂ©jÃƒÂ  ÃƒÂ©tÃƒÂ© traitÃƒÂ©.'], 422);
        }

        $commande = $litige->commande;
        if (!$commande) {
            return response()->json(['message' => 'Commande liÃƒÂ©e introuvable'], 404);
        }

        $decision = $request->decision;

        DB::beginTransaction();
        try {
            if ($decision === 'remboursement') {
                $alreadyRefunded = Transaction::where('commande_id', $commande->id)
                    ->where('type', 'remboursement')
                    ->exists();

                if (!$alreadyRefunded) {
                    Transaction::create([
                        'commande_id' => $commande->id,
                        'from_user_id' => null,
                        'to_user_id' => $commande->acheteur?->user?->id,
                        'reference' => 'REFUND-DISPUTE-' . $commande->id . '-' . now()->format('YmdHis'),
                        'type' => 'remboursement',
                        'operateur' => null,
                        'numero_masked' => null,
                        'montant' => $commande->montant_total,
                        'statut' => 'succeeded',
                        'meta' => ['reason' => 'admin_dispute_resolution'],
                    ]);
                }

                $commande->payment_status = 'refunded';
                $commande->escrow_status = 'refunded';
                $commande->statut = 'remboursee';

                if ($commande->bonRetrait) {
                    $commande->bonRetrait->otp_code = '000000';
                    $commande->bonRetrait->validated_at = null;
                    $commande->bonRetrait->otp_expires_at = now();
                    $commande->bonRetrait->instructions = 'Bon invalide: commande remboursee.';
                    $commande->bonRetrait->save();
                }

                $litige->statut = 'resolu_remboursement';
                $litige->resolution_type = 'remboursement';
            } elseif ($decision === 'reversement') {
                $commission = (float) $commande->commission;
                $sellerAmount = max(((float) $commande->sous_total) - $commission, 0);
                $sellerUserId = $commande->transformateur?->user_id;

                $alreadyPaidOut = Transaction::where('commande_id', $commande->id)
                    ->where('type', 'reversement')
                    ->exists();

                if (!$alreadyPaidOut && $sellerUserId) {
                    Transaction::create([
                        'commande_id' => $commande->id,
                        'from_user_id' => null,
                        'to_user_id' => $sellerUserId,
                        'reference' => 'PAYOUT-DISPUTE-' . $commande->id . '-' . now()->format('YmdHis'),
                        'type' => 'reversement',
                        'operateur' => null,
                        'numero_masked' => null,
                        'montant' => $sellerAmount,
                        'statut' => 'succeeded',
                        'meta' => ['reason' => 'admin_dispute_resolution'],
                    ]);

                    $wallet = Portefeuille::firstOrCreate(
                        ['user_id' => $sellerUserId],
                        ['solde_disponible' => 0, 'solde_bloque' => 0]
                    );

                    $wallet->solde_disponible = (float) $wallet->solde_disponible + $sellerAmount;
                    $wallet->save();
                }

                $alreadyCommission = Transaction::where('commande_id', $commande->id)
                    ->where('type', 'commission')
                    ->exists();

                if (!$alreadyCommission) {
                    Transaction::create([
                        'commande_id' => $commande->id,
                        'from_user_id' => null,
                        'to_user_id' => null,
                        'reference' => 'COMM-DISPUTE-' . $commande->id . '-' . now()->format('YmdHis'),
                        'type' => 'commission',
                        'operateur' => null,
                        'numero_masked' => null,
                        'montant' => $commission,
                        'statut' => 'succeeded',
                        'meta' => ['reason' => 'admin_dispute_resolution'],
                    ]);
                }

                $commande->escrow_status = 'released';
                $commande->statut = 'recue';

                $litige->statut = 'resolu_reversement';
                $litige->resolution_type = 'reversement';
            } else {
                // rejet: le litige est rejetÃƒÂ©, la commande revient ÃƒÂ  livrÃƒÂ©e
                $commande->statut = 'livree';
                $litige->statut = 'rejete';
                $litige->resolution_type = 'rejet';
            }

            $commande->save();

            $litige->resolution_note = $request->note;
            $litige->resolved_by = $user->id;
            $litige->resolved_at = now();
            $litige->save();

            DB::commit();

            $title = 'DÃƒÂ©cision de litige';
            $message = 'Le litige de la commande ' . $commande->numero . ' a ÃƒÂ©tÃƒÂ© traitÃƒÂ© par lÃ¢â‚¬â„¢administration. DÃƒÂ©cision: ' . strtoupper($decision) . '.';

            if ($commande->acheteur?->user) {
                $commande->acheteur->user->notify(new CommandeStatusNotification($commande, $title, $message));
            }
            if ($commande->transformateur?->user) {
                $commande->transformateur->user->notify(new CommandeStatusNotification($commande, $title, $message));
            }

            Log::info('LITIGE_RESOLU', [
                'litige_id' => $litige->id,
                'commande_id' => $commande->id,
                'decision' => $decision,
                'admin_id' => $user->id,
            ]);

            return response()->json([
                'message' => 'Litige traitÃƒÂ© avec succÃƒÂ¨s.',
                'litige' => [
                    'id' => $litige->id,
                    'statut' => $litige->statut,
                    'resolution_type' => $litige->resolution_type,
                    'resolved_at' => $litige->resolved_at,
                ],
                'commande' => [
                    'id' => $commande->id,
                    'statut' => $commande->statut,
                    'escrow_status' => $commande->escrow_status,
                    'payment_status' => $commande->payment_status,
                ],
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors du traitement du litige',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

