<?php

namespace App\Http\Controllers;

use App\Models\Acheteur;
use App\Models\BonRetrait;
use App\Models\Commande;
use App\Models\LigneCommande;
use App\Models\Portefeuille;
use App\Models\Produit;
use App\Models\Transaction;
use App\Models\Transformateur;
use App\Notifications\CommandeStatusNotification;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class CommandeController extends Controller
{
    /**
     * Acheteur: Creer une (ou plusieurs) commande(s) a partir du panier.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'acheteur') {
            return response()->json(['message' => 'Reserve aux acheteurs'], 403);
        }

        $request->validate([
            'panier' => 'required|array|min:1',
            'panier.*.id' => 'required|integer|exists:produits,id',
            'panier.*.quantite' => 'required|integer|min:1',
            'panier.*.mode_achat' => 'required|in:gros,detail',
            'mode_livraison' => 'required|in:domicile,retrait,point_retrait',
            'logistique_mode' => 'required|in:gozem,livreur_propre',
            'adresse_livraison' => 'required|string',
            'ville_livraison' => 'required|string',
            'telephone_livraison' => 'required|string',
            'paiement_operateur' => 'required|string',
            'numero_mobile' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $acheteur = Acheteur::where('user_id', $user->id)->lockForUpdate()->first();
            if (!$acheteur) {
                return response()->json(['message' => 'Profil acheteur introuvable'], 404);
            }

            $fraisLogistiqueFixe = $request->logistique_mode === 'livreur_propre' ? 0 : 2000;
            $commissionRate = $this->getCommissionRate($acheteur);
            $creditRemiseDisponible = (float) ($acheteur->credit_remise ?? 0);
            $panier = $request->panier;
            $paniersTransformateur = [];

            foreach ($panier as $item) {
                $produit = Produit::where('id', $item['id'])->lockForUpdate()->first();
                if (!$produit) {
                    throw ValidationException::withMessages([
                        'panier' => ['Un ou plusieurs produits du panier sont introuvables.'],
                    ]);
                }

                $modeAchat = strtolower((string) $item['mode_achat']);
                $modeVente = $produit->mode_vente ?? 'les_deux';
                $quantite = (int) $item['quantite'];
                $stock = (int) ($produit->stock ?? 0);

                if ($modeVente === 'detail' && $modeAchat !== 'detail') {
                    throw ValidationException::withMessages([
                        'panier' => ["Le produit {$produit->nom} est vendu uniquement au detail."],
                    ]);
                }

                if ($modeVente === 'gros' && $modeAchat !== 'gros') {
                    throw ValidationException::withMessages([
                        'panier' => ["Le produit {$produit->nom} est vendu uniquement en gros."],
                    ]);
                }

                if ($stock < $quantite) {
                    throw ValidationException::withMessages([
                        'panier' => ["Stock insuffisant pour {$produit->nom}. Disponible: {$stock}."],
                    ]);
                }

                $prixUnitaire = (float) $produit->prix_unitaire;
                if ($modeAchat === 'gros') {
                    $minimumGros = max((int) ($produit->quantite_min_gros ?? 20), 20);
                    if ($quantite < $minimumGros) {
                        throw ValidationException::withMessages([
                            'panier' => ["Le minimum en gros pour {$produit->nom} est {$minimumGros} unites."],
                        ]);
                    }

                    if ($produit->prix_gros === null) {
                        throw ValidationException::withMessages([
                            'panier' => ["Le produit {$produit->nom} n'a pas de prix de gros configure."],
                        ]);
                    }

                    $prixUnitaire = (float) $produit->prix_gros;
                }

                $transformateurId = $produit->transformateur_id;
                if (!isset($paniersTransformateur[$transformateurId])) {
                    $paniersTransformateur[$transformateurId] = [
                        'mode_achat' => $modeAchat,
                        'items' => [],
                    ];
                }

                if ($paniersTransformateur[$transformateurId]['mode_achat'] !== $modeAchat) {
                    throw ValidationException::withMessages([
                        'panier' => ['Chaque commande vendeur doit etre uniquement en gros ou uniquement au detail.'],
                    ]);
                }

                $paniersTransformateur[$transformateurId]['items'][] = [
                    'produit_id' => $produit->id,
                    'quantite' => $quantite,
                    'mode_achat' => $modeAchat,
                    'prix_unitaire' => $prixUnitaire,
                    'sous_total' => $prixUnitaire * $quantite,
                ];
            }

            $nombreTransformateurs = count($paniersTransformateur);
            if ($nombreTransformateurs === 0) {
                throw new \Exception('Panier invalide: aucun produit exploitable.');
            }

            $fraisBase = intdiv($fraisLogistiqueFixe, $nombreTransformateurs);
            $reste = $fraisLogistiqueFixe % $nombreTransformateurs;

            $createdCommandes = [];
            $commandesResume = [];
            $bonsRetrait = [];
            $notificationsQueue = [];
            $index = 0;

            foreach ($paniersTransformateur as $transformateurId => $payload) {
                $items = $payload['items'];
                $modeAchatCommande = $payload['mode_achat'];
                $transformateur = Transformateur::find($transformateurId);

                $montantItemsBrut = array_reduce($items, function ($carry, $item) {
                    return $carry + $item['sous_total'];
                }, 0);

                $remiseAppliquee = min($creditRemiseDisponible, $montantItemsBrut);
                $creditRemiseDisponible -= $remiseAppliquee;
                $montantItems = max($montantItemsBrut - $remiseAppliquee, 0);

                $fraisLivraison = $fraisBase + ($index < $reste ? 1 : 0);
                $commission = round($montantItems * ($commissionRate / 100), 2);
                $montantTotal = $montantItems + $fraisLivraison;

                $commande = Commande::create([
                    'acheteur_id' => $acheteur->id,
                    'transformateur_id' => $transformateurId,
                    'statut' => 'en_attente_confirmation',
                    'sous_total' => $montantItems,
                    'frais_livraison' => $fraisLivraison,
                    'commission' => $commission,
                    'commission_rate' => $commissionRate,
                    'remise_appliquee' => $remiseAppliquee,
                    'montant_total' => $montantTotal,
                    'mode_achat' => $modeAchatCommande,
                    'mode_livraison' => $request->mode_livraison,
                    'logistique_mode' => $request->logistique_mode,
                    'adresse_livraison' => $request->adresse_livraison,
                    'ville_livraison' => $request->ville_livraison,
                    'telephone_livraison' => $request->telephone_livraison,
                    'payment_status' => 'paid',
                    'escrow_status' => 'held',
                    'expires_at' => now()->addHours(24),
                ]);

                $commande->numero = 'CMD-' . str_pad((string) $commande->id, 4, '0', STR_PAD_LEFT);
                $commande->save();

                foreach ($items as $ligne) {
                    LigneCommande::create([
                        'commande_id' => $commande->id,
                        'produit_id' => $ligne['produit_id'],
                        'quantite' => $ligne['quantite'],
                        'mode_achat' => $ligne['mode_achat'],
                        'prix_unitaire' => $ligne['prix_unitaire'],
                        'sous_total' => $ligne['sous_total'],
                    ]);

                    Produit::where('id', $ligne['produit_id'])->decrement('stock', $ligne['quantite']);
                }

                if ($request->logistique_mode === 'livreur_propre' && $transformateur) {
                    $bon = $this->createBonRetrait($commande, $transformateur);
                    $bonsRetrait[] = [
                        'commande_id' => $commande->id,
                        'code' => $bon->code,
                        'otp_code' => $bon->otp_code,
                        'zone_retrait' => $bon->zone_retrait,
                        'gps_link' => $bon->gps_link,
                        'instructions' => $bon->instructions,
                    ];
                }

                Transaction::create([
                    'commande_id' => $commande->id,
                    'from_user_id' => $user->id,
                    'to_user_id' => null,
                    'reference' => 'PAY-' . $commande->id . '-' . now()->format('YmdHis'),
                    'type' => 'paiement',
                    'operateur' => $request->paiement_operateur,
                    'numero_masked' => $this->maskPhone((string) $request->input('numero_mobile', '')),
                    'montant' => $montantTotal,
                    'statut' => 'succeeded',
                    'meta' => [
                        'escrow_status' => 'held',
                        'logistique_mode' => $request->logistique_mode,
                    ],
                ]);

                $createdCommandes[] = $commande->id;
                $commandesResume[] = [
                    'id' => $commande->id,
                    'numero' => $commande->numero,
                    'statut' => $commande->statut,
                    'mode_achat' => $commande->mode_achat,
                    'logistique_mode' => $commande->logistique_mode,
                    'remise_appliquee' => $commande->remise_appliquee,
                    'commission_rate' => $commande->commission_rate,
                    'montant_total' => $commande->montant_total,
                ];

                $notificationsQueue[] = $commande;
                $index++;
            }

            Acheteur::where('id', $acheteur->id)->update(['credit_remise' => $creditRemiseDisponible]);

            DB::commit();

            foreach ($notificationsQueue as $commandeToNotify) {
                $commandeLoaded = Commande::with(['acheteur.user', 'transformateur.user'])->find($commandeToNotify->id);
                if (!$commandeLoaded) {
                    continue;
                }

                $this->notifyCommandeEvent(
                    $commandeLoaded,
                    'Commande creee',
                    'Votre commande ' . $commandeLoaded->numero . ' a ete creee et est en attente de confirmation du transformateur.',
                    true,
                    false
                );

                $this->notifyCommandeEvent(
                    $commandeLoaded,
                    'Nouvelle commande a confirmer',
                    'Une nouvelle commande ' . $commandeLoaded->numero . ' vient d etre payee et attend votre confirmation sous 24h.',
                    false,
                    true
                );
            }

            return response()->json([
                'message' => 'Commandes creees avec succes',
                'commandes_id' => $createdCommandes,
                'commandes' => $commandesResume,
                'bons_retrait' => $bonsRetrait,
                'avantages_plateforme' => [
                    'paiement_escrow' => true,
                    'historique_commandes' => true,
                    'gestion_litiges' => true,
                    'preuve_livraison' => true,
                    'points_fidelite' => true,
                ],
                'politique' => [
                    'anti_contournement' => 'Les ventes hors plateforme apres mise en relation sont interdites et peuvent entrainer des sanctions de compte.',
                ],
            ], 201);
        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la commande', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Acheteur: recuperer ses commandes
     */
    public function getAcheteurCommandes()
    {
        $user = Auth::user();
        $acheteur = Acheteur::where('user_id', $user->id)->first();
        if (!$acheteur) {
            return response()->json(['commandes' => []]);
        }

        $commandes = Commande::with(['items.produit', 'transformateur.user', 'bonRetrait'])
            ->where('acheteur_id', $acheteur->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($cmd) {
                return $this->formatCommande($cmd, true);
            });

        return response()->json([
            'commandes' => $commandes,
            'fidelite' => [
                'points' => (int) ($acheteur->points_fidelite ?? 0),
                'credit_remise' => (float) ($acheteur->credit_remise ?? 0),
            ],
            'engagement_plateforme' => [
                'anti_contournement' => 'Le partage de contacts pour contourner AgroStock est interdit et peut suspendre les comptes.',
            ],
        ]);
    }

    /**
     * Acheteur: recuperer un bon de retrait
     */
    public function getBonRetrait($id)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'acheteur') {
            return response()->json(['message' => 'Reserve aux acheteurs'], 403);
        }

        $acheteur = Acheteur::where('user_id', $user->id)->first();
        if (!$acheteur) {
            return response()->json(['message' => 'Profil acheteur introuvable'], 404);
        }

        $commande = Commande::with(['transformateur', 'bonRetrait'])
            ->where('id', $id)
            ->where('acheteur_id', $acheteur->id)
            ->first();

        if (!$commande || !$commande->bonRetrait) {
            return response()->json(['message' => 'Bon de retrait introuvable'], 404);
        }

        $normalizedStatus = $commande->statut === 'en_cours' ? 'en_cours_livraison' : $commande->statut;
        $isBonVisible = $commande->logistique_mode === 'livreur_propre'
            && in_array($normalizedStatus, ['en_attente_retrait_livreur', 'en_cours_livraison', 'livree'], true);

        if (!$isBonVisible) {
            return response()->json(['message' => 'Bon de retrait indisponible pour ce statut de commande'], 404);
        }

        return response()->json([
            'bon' => [
                'code' => $commande->bonRetrait->code,
                'otp_code' => $commande->bonRetrait->otp_code,
                'vendeur' => $commande->transformateur?->nom_entreprise,
                'zone_retrait' => $commande->bonRetrait->zone_retrait,
                'gps_link' => $commande->bonRetrait->gps_link,
                'instructions' => $commande->bonRetrait->instructions,
                'otp_expires_at' => $commande->bonRetrait->otp_expires_at,
            ],
        ]);
    }

    /**
     * Transformateur: recuperer ses commandes
     */
    public function getTransformateurCommandes()
    {
        $user = Auth::user();
        $transformateur = Transformateur::where('user_id', $user->id)->first();
        if (!$transformateur) {
            return response()->json(['commandes' => []]);
        }

        $commandes = Commande::with(['items.produit', 'acheteur.user', 'bonRetrait'])
            ->where('transformateur_id', $transformateur->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($cmd) {
                return $this->formatCommande($cmd, false);
            });

        return response()->json(['commandes' => $commandes]);
    }

    /**
     * Transformateur: valider le retrait avec code + OTP
     */
    public function validateRetrait(Request $request, $id)
    {
        $user = Auth::user();
        $transformateur = Transformateur::where('user_id', $user->id)->first();

        $request->validate([
            'bon_code' => 'required|string',
            'otp_code' => 'required|string|min:4|max:10',
        ]);

        $commande = Commande::with(['bonRetrait', 'acheteur.user', 'transformateur.user'])
            ->where('id', $id)
            ->where('transformateur_id', $transformateur?->id)
            ->first();

        if (!$commande) {
            return response()->json(['message' => 'Commande introuvable'], 404);
        }

        if ($commande->logistique_mode !== 'livreur_propre') {
            return response()->json(['message' => 'Cette commande n utilise pas le retrait livreur propre.'], 422);
        }

        if ($commande->statut !== 'en_attente_retrait_livreur') {
            return response()->json(['message' => 'La commande n est pas en attente de retrait.'], 422);
        }

        $bon = $commande->bonRetrait;
        if (!$bon) {
            return response()->json(['message' => 'Bon de retrait introuvable.'], 404);
        }

        if ($bon->validated_at) {
            return response()->json(['message' => 'Bon deja valide.'], 422);
        }

        if ($bon->code !== $request->bon_code || $bon->otp_code !== $request->otp_code) {
            return response()->json(['message' => 'Code bon ou OTP invalide.'], 422);
        }

        if ($bon->otp_expires_at && now()->greaterThan($bon->otp_expires_at)) {
            return response()->json(['message' => 'OTP expire.'], 422);
        }

        $bon->validated_at = now();
        $bon->save();

        $commande->statut = 'en_cours_livraison';
        $commande->shipped_at = now();
        $commande->save();

        $this->notifyCommandeEvent(
            $commande,
            'Retrait valide',
            'Le livreur de votre choix a retire la commande ' . $commande->numero . '. Livraison en cours.',
            true,
            false
        );

        return response()->json([
            'message' => 'Retrait valide, commande passee en livraison.',
            'statut' => $commande->statut,
        ]);
    }

    /**
     * Transformateur: mettre a jour le statut
     */
    public function updateStatus(Request $request, $id)
    {
        $user = Auth::user();
        $transformateur = Transformateur::where('user_id', $user->id)->first();

        $request->validate(['statut' => 'required|in:confirmee,en_cours,en_cours_livraison,livree']);

        $commande = Commande::with(['acheteur.user', 'transformateur.user'])
            ->where('id', $id)
            ->where('transformateur_id', $transformateur?->id)
            ->first();

        if (!$commande) {
            return response()->json(['message' => 'Commande introuvable'], 404);
        }

        $target = $request->statut === 'en_cours' ? 'en_cours_livraison' : $request->statut;

        if ($commande->logistique_mode === 'livreur_propre' && $target === 'en_cours_livraison' && $commande->statut === 'en_attente_retrait_livreur') {
            return response()->json([
                'message' => 'Utilisez la validation de retrait (code + OTP) pour passer en livraison.',
            ], 422);
        }

        $allowedTransitions = [
            'en_attente_confirmation' => ['confirmee'],
            'confirmee' => ['en_cours_livraison'],
            'en_attente_retrait_livreur' => ['en_cours_livraison'],
            'en_cours_livraison' => ['livree'],
        ];

        $current = $commande->statut === 'en_cours' ? 'en_cours_livraison' : $commande->statut;
        if (!isset($allowedTransitions[$current]) || !in_array($target, $allowedTransitions[$current], true)) {
            return response()->json([
                'message' => 'Transition de statut invalide',
                'current' => $current,
                'target' => $target,
            ], 422);
        }

        $statusToPersist = $target;
        if ($target === 'confirmee' && $commande->logistique_mode === 'livreur_propre') {
            $statusToPersist = 'en_attente_retrait_livreur';
        }

        $commande->statut = $statusToPersist;

        if (in_array($statusToPersist, ['confirmee', 'en_attente_retrait_livreur'], true)) {
            $commande->confirmed_at = now();
        }
        if ($statusToPersist === 'en_cours_livraison') {
            $commande->shipped_at = now();
        }
        if ($statusToPersist === 'livree') {
            $commande->delivered_at = now();
        }

        try {
            $commande->save();
        } catch (QueryException $e) {
            if ($statusToPersist === 'en_cours_livraison') {
                $statusToPersist = 'en_cours';
                $commande->statut = $statusToPersist;
                $commande->save();
            } else {
                throw $e;
            }
        }

        $messageByStatus = [
            'confirmee' => 'Votre commande ' . $commande->numero . ' a ete confirmee par le transformateur.',
            'en_attente_retrait_livreur' => 'Commande ' . $commande->numero . ' confirmee. Bon de retrait actif, votre livreur peut venir avec code et OTP.',
            'en_cours_livraison' => 'Votre commande ' . $commande->numero . ' est en cours de livraison.',
            'livree' => 'Votre commande ' . $commande->numero . ' a ete marquee comme livree. Merci de confirmer la reception.',
        ];

        $displayStatus = $statusToPersist === 'en_cours' ? 'en_cours_livraison' : $statusToPersist;

        $this->notifyCommandeEvent(
            $commande,
            'Mise a jour commande',
            $messageByStatus[$displayStatus] ?? ('Le statut de votre commande ' . $commande->numero . ' a ete mis a jour.'),
            true,
            false
        );

        return response()->json(['message' => 'Statut mis a jour', 'statut' => $displayStatus]);
    }

    /**
     * Acheteur: confirmer reception
     */
    public function confirmReception($id)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'acheteur') {
            return response()->json(['message' => 'Reserve aux acheteurs'], 403);
        }

        $acheteur = Acheteur::where('user_id', $user->id)->first();
        if (!$acheteur) {
            return response()->json(['message' => 'Profil acheteur introuvable'], 404);
        }

        $commande = Commande::with(['transformateur', 'acheteur.user', 'transformateur.user'])
            ->where('id', $id)
            ->where('acheteur_id', $acheteur->id)
            ->first();

        if (!$commande) {
            return response()->json(['message' => 'Commande introuvable'], 404);
        }

        if ($commande->statut !== 'livree') {
            return response()->json(['message' => 'La reception ne peut etre confirmee que pour une commande livree'], 422);
        }

        DB::beginTransaction();
        try {
            $commande->statut = 'recue';
            $commande->received_at = now();
            $commande->escrow_status = 'released';
            $commande->save();

            $transformateur = $commande->transformateur;
            $sellerUserId = $transformateur?->user_id;

            $commission = (float) $commande->commission;
            $sellerAmount = max(((float) $commande->sous_total) - $commission, 0);

            if ($sellerUserId) {
                Transaction::create([
                    'commande_id' => $commande->id,
                    'from_user_id' => null,
                    'to_user_id' => $sellerUserId,
                    'reference' => 'PAYOUT-' . $commande->id . '-' . now()->format('YmdHis'),
                    'type' => 'reversement',
                    'operateur' => null,
                    'numero_masked' => null,
                    'montant' => $sellerAmount,
                    'statut' => 'succeeded',
                ]);

                $wallet = Portefeuille::firstOrCreate(
                    ['user_id' => $sellerUserId],
                    ['solde_disponible' => 0, 'solde_bloque' => 0]
                );
                $wallet->solde_disponible = (float) $wallet->solde_disponible + $sellerAmount;
                $wallet->save();
            }

            Transaction::create([
                'commande_id' => $commande->id,
                'from_user_id' => null,
                'to_user_id' => null,
                'reference' => 'COMM-' . $commande->id . '-' . now()->format('YmdHis'),
                'type' => 'commission',
                'operateur' => null,
                'numero_masked' => null,
                'montant' => $commission,
                'statut' => 'succeeded',
            ]);

            $pointsGagnes = (int) floor(((float) $commande->montant_total) / 1000);
            $creditGagne = round(((float) $commande->sous_total) * 0.01, 2);
            Acheteur::where('id', $acheteur->id)->update([
                'points_fidelite' => DB::raw('points_fidelite + ' . $pointsGagnes),
                'credit_remise' => DB::raw('credit_remise + ' . $creditGagne),
            ]);

            DB::commit();

            $this->notifyCommandeEvent(
                $commande,
                'Reception confirmee',
                'La reception de la commande ' . $commande->numero . ' a ete confirmee. La commande est cloturee.',
                true,
                true
            );

            return response()->json([
                'message' => 'Reception confirmee. Commande cloturee.',
                'statut' => $commande->statut,
                'commission' => $commande->commission,
                'points_gagnes' => $pointsGagnes,
                'credit_remise_gagne' => $creditGagne,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erreur lors de la confirmation de reception',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function formatCommande($cmd, bool $forAcheteur)
    {
        $itemsFormatted = $cmd->items->map(function ($ligne) {
            $photos = $ligne->produit && $ligne->produit->photos ? (is_array($ligne->produit->photos) ? $ligne->produit->photos : json_decode($ligne->produit->photos, true)) : [];
            return [
                'id' => $ligne->id,
                'produit_id' => $ligne->produit_id,
                'nom' => $ligne->produit ? $ligne->produit->nom : 'Produit inconnu',
                'image_url' => !empty($photos) ? url('storage/' . $photos[0]) : null,
                'quantite' => $ligne->quantite,
                'mode_achat' => $ligne->mode_achat ?? 'detail',
                'prix_unitaire' => $ligne->prix_unitaire,
                'sous_total' => $ligne->sous_total,
            ];
        });

        $clientNom = $cmd->acheteur && $cmd->acheteur->user ? $cmd->acheteur->user->nom_complet : 'Anonyme';
        $vendeurNom = $cmd->transformateur ? $cmd->transformateur->nom_entreprise : 'Inconnu';

        $normalizedStatus = $cmd->statut === 'en_cours' ? 'en_cours_livraison' : $cmd->statut;

        $bon = $cmd->bonRetrait;
        $bonPayload = null;
        $canExposeBon = $cmd->logistique_mode === 'livreur_propre'
            && in_array($normalizedStatus, ['en_attente_retrait_livreur', 'en_cours_livraison', 'livree'], true);

        if ($bon && $canExposeBon) {
            $gpsLink = $bon->gps_link;
            if (empty($gpsLink)) {
                if (!empty($cmd->transformateur?->latitude) && !empty($cmd->transformateur?->longitude)) {
                    $gpsLink = 'https://maps.google.com/?q=' . $cmd->transformateur->latitude . ',' . $cmd->transformateur->longitude;
                } else {
                    $zoneFallback = $bon->zone_retrait ?: 'Benin';
                    $gpsLink = 'https://maps.google.com/?q=' . urlencode($zoneFallback);
                }
            }

            $bonPayload = [
                'code' => $bon->code,
                'zone_retrait' => $bon->zone_retrait,
                'gps_link' => $gpsLink,
                'instructions' => $bon->instructions,
                'otp_expires_at' => $bon->otp_expires_at,
                'validated_at' => $bon->validated_at,
            ];
            if ($forAcheteur) {
                $bonPayload['otp_code'] = $bon->otp_code;
            }
        }

        return [
            'id' => $cmd->id,
            'numero' => $cmd->numero ?: 'CMD-' . str_pad((string) $cmd->id, 4, '0', STR_PAD_LEFT),
            'client_nom' => $clientNom,
            'vendeur_nom' => $vendeurNom,
            'sous_total' => $cmd->sous_total,
            'frais_livraison' => $cmd->frais_livraison,
            'commission' => $cmd->commission,
            'commission_rate' => $cmd->commission_rate,
            'remise_appliquee' => $cmd->remise_appliquee,
            'montant_total' => $cmd->montant_total,
            'mode_achat' => $cmd->mode_achat ?? 'detail',
            'mode_livraison' => $cmd->mode_livraison,
            'logistique_mode' => $cmd->logistique_mode ?? 'gozem',
            'statut' => $normalizedStatus,
            'adresse_livraison' => $cmd->adresse_livraison,
            'ville_livraison' => $cmd->ville_livraison,
            'telephone_livraison' => $cmd->telephone_livraison,
            'date' => $cmd->created_at,
            'expires_at' => $cmd->expires_at,
            'items' => $itemsFormatted,
            'bon_retrait' => $bonPayload,
        ];
    }

    private function createBonRetrait(Commande $commande, Transformateur $transformateur): BonRetrait
    {
        $code = 'BRT-' . str_pad((string) $commande->id, 4, '0', STR_PAD_LEFT) . '-' . random_int(10, 99);
        $otp = (string) random_int(100000, 999999);

        $zoneRetraitParts = array_filter([
            $transformateur->commune ?? null,
            $transformateur->departement ?? null,
            'Benin',
        ]);
        $zoneRetrait = implode(', ', $zoneRetraitParts);

        if (!empty($transformateur->latitude) && !empty($transformateur->longitude)) {
            $gpsLink = 'https://maps.google.com/?q=' . $transformateur->latitude . ',' . $transformateur->longitude;
        } else {
            $gpsLink = 'https://maps.google.com/?q=' . urlencode($zoneRetrait);
        }

        return BonRetrait::create([
            'commande_id' => $commande->id,
            'code' => $code,
            'otp_code' => $otp,
            'otp_expires_at' => now()->addHours(24),
            'zone_retrait' => $zoneRetrait,
            'gps_link' => $gpsLink,
            'instructions' => 'Votre livreur doit presenter ce bon et fournir OTP. Pas de remise sans validation.',
        ]);
    }

    private function getCommissionRate(Acheteur $acheteur): float
    {
        $historique = Commande::where('acheteur_id', $acheteur->id)
            ->whereIn('statut', ['livree', 'recue'])
            ->count();

        if ($historique >= 2) {
            return 8.00;
        }

        return 10.00;
    }

    private function notifyCommandeEvent(Commande $commande, string $title, string $message, bool $notifyAcheteur, bool $notifyTransformateur): void
    {
        $commande->loadMissing(['acheteur.user', 'transformateur.user']);

        if ($notifyAcheteur && $commande->acheteur?->user) {
            $commande->acheteur->user->notify(new CommandeStatusNotification($commande, $title, $message));
            Log::info('SMS_SIMULATION', [
                'to' => $commande->acheteur->user->telephone,
                'message' => $message,
                'commande' => $commande->numero,
            ]);
        }

        if ($notifyTransformateur && $commande->transformateur?->user) {
            $commande->transformateur->user->notify(new CommandeStatusNotification($commande, $title, $message));
            Log::info('SMS_SIMULATION', [
                'to' => $commande->transformateur->user->telephone,
                'message' => $message,
                'commande' => $commande->numero,
            ]);
        }
    }

    private function maskPhone(string $phone): ?string
    {
        $digits = preg_replace('/\D+/', '', $phone ?? '');
        if (!$digits) {
            return null;
        }

        $len = strlen($digits);
        if ($len <= 4) {
            return str_repeat('*', $len);
        }

        return str_repeat('*', $len - 4) . substr($digits, -4);
    }
}





