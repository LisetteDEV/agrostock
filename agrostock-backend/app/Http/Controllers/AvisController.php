<?php

namespace App\Http\Controllers;

use App\Models\Avis;
use App\Models\Transformateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AvisController extends Controller
{
    /**
     * Liste des avis publics d'un transformateur
     */
    public function getByTransformateur($transformateur_id)
    {
        $avis = Avis::with('acheteur')
            ->where('transformateur_id', $transformateur_id)
            ->where('statut', 'visible')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($a) {
                return [
                    'id'                => $a->id,
                    'note'              => $a->note,
                    'commentaire'       => $a->commentaire,
                    'acheteur_nom'      => $a->acheteur?->nom_complet ?? 'Acheteur',
                    'transformateur_id' => $a->transformateur_id,
                    'date'              => $a->created_at,
                ];
            });

        return response()->json(['avis' => $avis]);
    }

    /**
     * Tous les avis (page d'accueil) — publics uniquement
     */
    public function getRecents()
    {
        $avis = Avis::with(['acheteur', 'transformateur'])
            ->where('statut', 'visible')
            ->orderBy('created_at', 'desc')
            ->limit(6)
            ->get()
            ->map(function ($a) {
                return [
                    'id'                  => $a->id,
                    'note'                => $a->note,
                    'commentaire'         => $a->commentaire,
                    'acheteur_nom'        => $a->acheteur?->nom_complet ?? 'Acheteur',
                    'transformateur_nom'  => $a->transformateur?->nom_entreprise ?? '',
                    'transformateur_id'   => $a->transformateur_id,
                    'date'                => $a->created_at,
                ];
            });

        return response()->json(['avis' => $avis]);
    }

    /**
     * Mes avis (acheteur connecté)
     */
    public function mesAvis(Request $request)
    {
        $user = $request->user();

        $avis = Avis::with('transformateur')
            ->where('acheteur_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($a) {
                return [
                    'id'                  => $a->id,
                    'note'                => $a->note,
                    'commentaire'         => $a->commentaire,
                    'transformateur_nom'  => $a->transformateur?->nom_entreprise ?? '',
                    'transformateur_id'   => $a->transformateur_id,
                    'statut'              => $a->statut,
                    'date'                => $a->created_at,
                ];
            });

        return response()->json(['avis' => $avis]);
    }

    /**
     * Publier un avis (acheteur connecté)
     */
    public function store(Request $request)
    {
        $request->validate([
            'transformateur_id' => 'required|exists:transformateurs,id',
            'note'              => 'required|integer|min:1|max:5',
            'commentaire'       => 'required|string|min:5|max:1000',
        ]);

        $user = $request->user();

        // Vérifier que l'acheteur n'a pas déjà posté un avis pour ce transformateur
        $exists = Avis::where('acheteur_id', $user->id)
                      ->where('transformateur_id', $request->transformateur_id)
                      ->exists();

        if ($exists) {
            return response()->json(['message' => 'Vous avez déjà laissé un avis pour ce transformateur.'], 409);
        }

        $avis = Avis::create([
            'acheteur_id'       => $user->id,
            'transformateur_id' => $request->transformateur_id,
            'commande_id'       => $request->commande_id ?? null,
            'note'              => $request->note,
            'commentaire'       => $request->commentaire,
            'statut'            => 'visible',
            'signale'           => false,
        ]);

        return response()->json([
            'message' => 'Avis publié avec succès.',
            'avis'    => [
                'id'                  => $avis->id,
                'note'                => $avis->note,
                'commentaire'         => $avis->commentaire,
                'transformateur_id'   => $avis->transformateur_id,
                'transformateur_nom'  => Transformateur::find($avis->transformateur_id)?->nom_entreprise,
                'acheteur_nom'        => $user->nom_complet,
                'date'                => $avis->created_at,
            ]
        ], 201);
    }

    /**
     * Supprimer un de mes avis
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $avis = Avis::where('id', $id)->where('acheteur_id', $user->id)->first();

        if (!$avis) {
            return response()->json(['message' => 'Avis introuvable.'], 404);
        }

        $avis->delete();
        return response()->json(['message' => 'Avis supprimé.']);
    }

    /**
     * Admin: Lister tous les avis
     */
    public function getAllForAdmin()
    {
        $avis = Avis::with(['acheteur', 'transformateur'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($a) {
                return [
                    'id'                  => $a->id,
                    'note'                => $a->note,
                    'commentaire'         => $a->commentaire,
                    'acheteur_nom'        => $a->acheteur?->nom_complet ?? 'Acheteur',
                    'transformateur_nom'  => $a->transformateur?->nom_entreprise ?? '',
                    'statut'              => $a->statut,
                    'signale'             => $a->signale,
                    'date'                => $a->created_at,
                ];
            });
        return response()->json(['avis' => $avis]);
    }

    /**
     * Admin: Masquer/Démasquer un avis
     */
    public function toggleVisibilityAdmin($id)
    {
        $avis = Avis::findOrFail($id);
        $avis->statut = $avis->statut === 'visible' ? 'masque' : 'visible';
        $avis->save();
        return response()->json(['message' => 'Statut modifié', 'statut' => $avis->statut]);
    }

    /**
     * Admin: Supprimer un avis définitivement
     */
    public function destroyAdmin($id)
    {
        $avis = Avis::findOrFail($id);
        $avis->delete();
        return response()->json(['message' => 'Avis supprimé.']);
    }
}
