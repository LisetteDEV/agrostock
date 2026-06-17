<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Transformateur;
use App\Models\Produit;
use App\Models\Commande;
use App\Models\Transaction;
use App\Models\Litige;
use App\Models\Avis;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Get summary statistics for the dashboard
     */
    public function getDashboardStats()
    {
        if (!$this->isAdmin()) {
            return response()->json(['message' => 'Réservé aux administrateurs'], 403);
        }

        $totalUsers = User::where('role', '!=', 'admin')->count();
        $pendingTrans = Transformateur::where('statut_verification', 'en_attente')->count();

        $monthlyCommands = Commande::whereYear('created_at', now()->year)
            ->whereMonth('created_at', now()->month)
            ->count();

        $commissionRevenue = (float) Transaction::where('type', 'commission')
            ->where('statut', 'succeeded')
            ->sum('montant');

        $openDisputes = Litige::whereIn('statut', ['ouvert', 'en_cours'])->count();

        $escrowTotal = (float) Commande::where('escrow_status', 'held')
            ->where('payment_status', 'paid')
            ->sum('montant_total');

        return response()->json([
            'total_users' => $totalUsers,
            'pending_transformateurs' => $pendingTrans,
            'total_products' => Produit::count(),
            'monthly_commands' => $monthlyCommands,
            'revenue' => number_format($commissionRevenue, 0, ',', ' ') . ' FCFA',
            'revenue_raw' => $commissionRevenue,
            'escrow_total_raw' => $escrowTotal,
            'open_disputes' => $openDisputes,
            'flagged_reviews' => Avis::where('signale', true)->count(),
            'new_users_today' => User::whereDate('created_at', date('Y-m-d'))->count(),
            'pending_contact_messages' => ContactMessage::where('statut', 'nouveau')->count(),
        ]);
    }

    /**
     * Finance summary cards
     */
    public function getFinanceStats()
    {
        if (!$this->isAdmin()) {
            return response()->json(['message' => 'Réservé aux administrateurs'], 403);
        }

        $encaisseTotal = (float) Transaction::where('type', 'paiement')->where('statut', 'succeeded')->sum('montant');
        $reversements = (float) Transaction::where('type', 'reversement')->where('statut', 'succeeded')->sum('montant');
        $remboursements = (float) Transaction::where('type', 'remboursement')->where('statut', 'succeeded')->sum('montant');
        $commissions = (float) Transaction::where('type', 'commission')->where('statut', 'succeeded')->sum('montant');
        $escrow = (float) Commande::where('escrow_status', 'held')->where('payment_status', 'paid')->sum('montant_total');

        return response()->json([
            'encaisse_total' => $encaisseTotal,
            'reversements_total' => $reversements,
            'remboursements_total' => $remboursements,
            'commissions_total' => $commissions,
            'escrow_total' => $escrow,
            'count_success' => Transaction::where('statut', 'succeeded')->count(),
            'count_failed' => Transaction::where('statut', 'failed')->count(),
            'count_refunds' => Transaction::where('type', 'remboursement')->where('statut', 'succeeded')->count(),
        ]);
    }

    /**
     * Transactions list for admin
     */
    public function getTransactions()
    {
        if (!$this->isAdmin()) {
            return response()->json(['message' => 'Réservé aux administrateurs'], 403);
        }

        $transactions = Transaction::with(['commande', 'commande.acheteur.user', 'commande.transformateur.user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Transaction $t) {
                $commandeNumero = $t->commande?->numero ?: ($t->commande ? ('CMD-' . str_pad((string) $t->commande->id, 4, '0', STR_PAD_LEFT)) : null);

                $statusLabel = match ($t->statut) {
                    'succeeded' => 'Succès',
                    'failed' => 'Échec',
                    default => ucfirst($t->statut ?? 'N/A'),
                };

                if ($t->type === 'remboursement' && $t->statut === 'succeeded') {
                    $statusLabel = 'Remboursé';
                }

                return [
                    'id' => $t->id,
                    'reference' => $t->reference,
                    'commande' => $commandeNumero,
                    'type' => $t->type,
                    'methode' => $t->operateur ?: 'Interne',
                    'montant' => (float) $t->montant,
                    'statut' => $statusLabel,
                    'statut_raw' => $t->statut,
                    'date' => $t->created_at,
                    'acheteur' => $t->commande?->acheteur?->user?->nom_complet,
                    'transformateur' => $t->commande?->transformateur?->nom_entreprise,
                ];
            });

        return response()->json(['transactions' => $transactions]);
    }

    /**
     * Get all users (buyers and processors)
     */
    public function getUsers()
    {
        $users = User::with(['acheteur', 'transformateur'])
            ->where('role', '!=', 'admin')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'nom' => $user->nom_complet,
                    'email' => $user->email,
                    'role' => ucfirst($user->role),
                    'statut' => ucfirst($user->statut),
                    'date' => $user->created_at->format('d M Y'),
                    'dept' => $user->role === 'acheteur' && $user->acheteur ? $user->acheteur->departement :
                             ($user->role === 'transformateur' && $user->transformateur ? $user->transformateur->departement : 'Non défini')
                ];
            });

        return response()->json($users);
    }

    /**
     * Get pending processors
     */
    public function getPendingTransformateurs()
    {
        $pending = User::where('role', 'transformateur')
            ->whereHas('transformateur', function ($q) {
                $q->where('statut_verification', 'en_attente');
            })
            ->with('transformateur')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'nom' => $user->nom_complet,
                    'email' => $user->email,
                    'date' => $user->created_at->format('d/m/Y'),
                    'statut' => 'En attente',
                    'type' => $user->transformateur ? ucfirst($user->transformateur->type_entreprise) : 'Non défini',
                    'entreprise' => $user->transformateur ? $user->transformateur->nom_entreprise : 'N/A',
                    'piece_identite' => $user->transformateur ? $user->transformateur->piece_identite : null,
                    'registre_commerce' => $user->transformateur ? $user->transformateur->registre_commerce : null,
                    'photo_atelier' => $user->transformateur ? $user->transformateur->photo_atelier : null,
                ];
            });

        return response()->json($pending);
    }

    /**
     * Admin list of all commandes with dispute status
     */
    public function getAdminCommandes()
    {
        if (!$this->isAdmin()) {
            return response()->json(['message' => 'Réservé aux administrateurs'], 403);
        }

        $commandes = Commande::with(['acheteur.user', 'transformateur.user', 'items.produit', 'litige'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function (Commande $cmd) {
                return [
                    'id' => $cmd->id,
                    'numero' => $cmd->numero ?: ('CMD-' . str_pad((string) $cmd->id, 4, '0', STR_PAD_LEFT)),
                    'acheteur' => $cmd->acheteur?->user?->nom_complet,
                    'transformateur' => $cmd->transformateur?->nom_entreprise,
                    'ville' => $cmd->ville_livraison,
                    'montant_total' => (float) $cmd->montant_total,
                    'sous_total' => (float) $cmd->sous_total,
                    'frais_livraison' => (float) $cmd->frais_livraison,
                    'commission' => (float) $cmd->commission,
                    'statut' => $cmd->statut,
                    'escrow_status' => $cmd->escrow_status,
                    'payment_status' => $cmd->payment_status,
                    'date' => $cmd->created_at,
                    'litige' => $cmd->litige ? [
                        'id' => $cmd->litige->id,
                        'statut' => $cmd->litige->statut,
                        'motif' => $cmd->litige->motif,
                    ] : null,
                    'items' => $cmd->items->map(function ($it) {
                        return [
                            'nom' => $it->produit?->nom,
                            'quantite' => $it->quantite,
                            'prix_unitaire' => (float) $it->prix_unitaire,
                            'sous_total' => (float) $it->sous_total,
                        ];
                    }),
                ];
            });

        return response()->json(['commandes' => $commandes]);
    }

    /**
     * Approve a transformateur
     */
    public function approveTransformateur($id)
    {
        if (!$this->isAdmin()) {
            return response()->json(['message' => 'Réservé aux administrateurs'], 403);
        }

        $user = User::where('role', 'transformateur')->findOrFail($id);

        DB::beginTransaction();
        try {
            $user->update(['statut' => 'actif']);

            if ($user->transformateur) {
                $user->transformateur->update([
                    'statut_verification' => 'verifie',
                    'verifie_le' => now(),
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Transformateur approuvé avec succès']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de l\'approbation'], 500);
        }
    }

    /**
     * Reject a transformateur
     */
    public function rejectTransformateur(Request $request, $id)
    {
        if (!$this->isAdmin()) {
            return response()->json(['message' => 'Réservé aux administrateurs'], 403);
        }

        $user = User::where('role', 'transformateur')->findOrFail($id);

        $request->validate(['motif' => 'required|string']);

        DB::beginTransaction();
        try {
            $user->update(['statut' => 'suspendu']);

            if ($user->transformateur) {
                $user->transformateur->update([
                    'statut_verification' => 'rejete',
                    'motif_rejet' => $request->motif,
                    'verifie_le' => now(),
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Transformateur rejeté']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors du rejet'], 500);
        }
    }

    /**
     * Suspendre un utilisateur (hors admin)
     */
    public function suspendUser($id)
    {
        if (!$this->isAdmin()) {
            return response()->json(['message' => 'Reserve aux administrateurs'], 403);
        }

        $user = User::where('role', '!=', 'admin')->findOrFail($id);

        if ($user->statut === 'suspendu') {
            return response()->json(['message' => 'Cet utilisateur est deja suspendu.']);
        }

        $user->update(['statut' => 'suspendu']);
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Utilisateur suspendu avec succes.',
            'user' => [
                'id' => $user->id,
                'statut' => ucfirst($user->statut),
            ],
        ]);
    }

    /**
     * Reactiver un utilisateur suspendu/inactif
     */
    public function reactivateUser($id)
    {
        if (!$this->isAdmin()) {
            return response()->json(['message' => 'Reserve aux administrateurs'], 403);
        }

        $user = User::where('role', '!=', 'admin')->findOrFail($id);

        if ($user->statut === 'actif') {
            return response()->json(['message' => 'Cet utilisateur est deja actif.']);
        }

        $user->update(['statut' => 'actif']);

        return response()->json([
            'message' => 'Utilisateur reactive avec succes.',
            'user' => [
                'id' => $user->id,
                'statut' => ucfirst($user->statut),
            ],
        ]);
    }

    /**
     * Suppression douce securisee d'un utilisateur (hors admin)
     */
    public function softDeleteUser($id)
    {
        if (!$this->isAdmin()) {
            return response()->json(['message' => 'Reserve aux administrateurs'], 403);
        }

        $currentAdmin = Auth::user();
        if ($currentAdmin && (int) $currentAdmin->id === (int) $id) {
            return response()->json(['message' => 'Action interdite sur votre propre compte.'], 422);
        }

        $user = User::where('role', '!=', 'admin')->findOrFail($id);

        DB::beginTransaction();
        try {
            $user->tokens()->delete();
            if ($user->statut !== 'inactif') {
                $user->statut = 'inactif';
                $user->save();
            }

            $user->delete();

            DB::commit();

            return response()->json([
                'message' => 'Utilisateur supprime (archivage) avec succes.',
                'user' => [
                    'id' => (int) $id,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la suppression.'], 500);
        }
    }

    /**
     * Get all products with their transformateur info
     */
    public function getAllProducts()
    {
        if (!$this->isAdmin()) {
            return response()->json(['message' => 'Réservé aux administrateurs'], 403);
        }

        $categoriesNames = DB::table('categories')->pluck('nom', 'id')->toArray();

        $produits = Produit::with(['transformateur.user'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($p) use ($categoriesNames) {
                return [
                    'id' => $p->id,
                    'nom' => $p->nom,
                    'prix' => number_format($p->prix_unitaire, 0, ',', ' '),
                    'statut' => $p->statut === 'actif' ? 'Actif' : ($p->statut === 'en_attente' ? 'En attente' : ($p->statut === 'rejete' ? 'Rejeté' : ($p->statut === 'epuise' ? 'Épuisé' : ucfirst($p->statut)))),
                    'transformateur' => $p->transformateur && $p->transformateur->user ? $p->transformateur->user->nom_complet : 'Inconnu',
                    'entreprise' => $p->transformateur ? $p->transformateur->nom_entreprise : 'N/A',
                    'categorie' => $categoriesNames[$p->categorie_id] ?? 'Non défini'
                ];
            });

        return response()->json($produits);
    }

    /**
     * Supprimer un produit
     */
    public function deleteProduct($id)
    {
        if (!$this->isAdmin()) {
            return response()->json(['message' => 'Réservé aux administrateurs'], 403);
        }

        $produit = Produit::findOrFail($id);

        $isReferencedInOrders = DB::table('ligne_commandes')
            ->where('produit_id', $produit->id)
            ->exists();

        if ($isReferencedInOrders) {
            if ($produit->statut !== 'epuise') {
                $produit->update(['statut' => 'epuise']);
            }

            return response()->json([
                'message' => 'Produit lie a des commandes: il a ete desactive sans supprimer l\'historique.',
                'action' => 'deactivated',
            ]);
        }

        $produit->delete();

        return response()->json([
            'message' => 'Produit supprim?.',
            'action' => 'deleted',
        ]);
    }

    /**
     * Lister les transformateurs publiquement (sans auth)
     */
    public function getPublicTransformateurs()
    {
        $transformateurs = Transformateur::with('user')
            ->where('statut_verification', 'verifie')
            ->whereHas('user', function ($q) {
                $q->where('statut', 'actif');
            })
            ->get()
            ->map(function ($t) {
                $nbProduits = Produit::where('transformateur_id', $t->id)
                    ->where('statut', 'actif')
                    ->count();

                $logoUrl = $t->logo ? url('storage/' . $t->logo) : null;
                $atelierUrl = $t->photo_atelier ? url('storage/' . $t->photo_atelier) : null;

                return [
                    'id' => $t->id,
                    'nom_entreprise' => $t->nom_entreprise,
                    'type_entreprise' => $t->type_entreprise,
                    'description' => $t->description,
                    'commune' => $t->commune,
                    'departement' => $t->departement,
                    'latitude' => $t->latitude !== null ? (float) $t->latitude : null,
                    'longitude' => $t->longitude !== null ? (float) $t->longitude : null,
                    'mode_vente' => $t->mode_vente,
                    'statut_verification' => $t->statut_verification,
                    'logo_url' => $logoUrl,
                    'atelier_url' => $atelierUrl,
                    'nb_produits' => $nbProduits,
                    'initiales' => strtoupper(substr($t->nom_entreprise, 0, 2)),
                    'proprietaire' => $t->user?->nom_complet,
                ];
            });

        return response()->json(['transformateurs' => $transformateurs], 200);
    }

    private function isAdmin(): bool
    {
        $user = Auth::user();
        return (bool) ($user && $user->role === 'admin');
    }
}



