<?php

namespace App\Http\Controllers;

use App\Jobs\PublierProduitSurFacebook;
use App\Models\Produit;
use App\Models\Transformateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProduitController extends Controller
{
    /**
     * Lister les produits publies (route publique, sans auth)
     */
    public function getPublics(Request $request)
    {
        $query = Produit::where('statut', 'actif');

        if ($request->filled('categorie_id')) {
            $query->where('categorie_id', $request->categorie_id);
        }
        if ($request->filled('search')) {
            $query->where('nom', 'like', '%' . $request->search . '%');
        }

        $produits = $query->orderBy('created_at', 'desc')->get()->map(function ($p) {
            $transformateur = Transformateur::find($p->transformateur_id);
            $photos = $p->photos ? (is_array($p->photos) ? $p->photos : json_decode($p->photos, true)) : [];
            $imageUrl = !empty($photos) ? url('storage/' . $photos[0]) : null;

            return [
                'id' => $p->id,
                'nom' => $p->nom,
                'description' => $p->description,
                'prix_unitaire' => $p->prix_unitaire,
                'prix_gros' => $p->prix_gros,
                'mode_vente' => $p->mode_vente ?? 'les_deux',
                'quantite_min_gros' => (int) ($p->quantite_min_gros ?? 20),
                'stock' => $p->stock,
                'unite_mesure' => $p->unite_mesure,
                'categorie_id' => $p->categorie_id,
                'statut' => $p->statut,
                'image_url' => $imageUrl,
                'transformateur_id' => $transformateur ? $transformateur->id : null,
                'entreprise' => $transformateur ? $transformateur->nom_entreprise : 'Inconnu',
                'commune' => $transformateur ? $transformateur->commune : '',
                'vendeur_initiales' => $transformateur ? strtoupper(substr($transformateur->nom_entreprise, 0, 2)) : '??',
            ];
        });

        return response()->json(['produits' => $produits], 200);
    }

    /**
     * Recuperer un seul produit public par son ID
     */
    public function getPublicSingle($id)
    {
        $p = Produit::find($id);
        if (!$p) {
            return response()->json(['message' => 'Produit non trouve'], 404);
        }

        $transformateur = Transformateur::find($p->transformateur_id);
        $photos = $p->photos ? (is_array($p->photos) ? $p->photos : json_decode($p->photos, true)) : [];
        $imageUrls = array_map(fn($path) => url('storage/' . $path), $photos);

        $categorie = DB::table('categories')->find($p->categorie_id);

        return response()->json([
            'produit' => [
                'id' => $p->id,
                'nom' => $p->nom,
                'description' => $p->description,
                'prix_unitaire' => $p->prix_unitaire,
                'prix_gros' => $p->prix_gros,
                'mode_vente' => $p->mode_vente ?? 'les_deux',
                'quantite_min_gros' => (int) ($p->quantite_min_gros ?? 20),
                'stock' => $p->stock,
                'unite_mesure' => $p->unite_mesure,
                'delai_livraison' => $p->delai_livraison,
                'statut' => $p->statut,
                'categorie' => $categorie ? $categorie->nom : null,
                'images' => $imageUrls,
                'entreprise' => $transformateur ? $transformateur->nom_entreprise : 'Inconnu',
                'transformateur_id' => $transformateur ? $transformateur->id : null,
                'commune' => $transformateur ? $transformateur->commune : '',
                'departement' => $transformateur ? $transformateur->departement : '',
                'type_entreprise' => $transformateur ? $transformateur->type_entreprise : '',
                'vendeur_initiales' => $transformateur ? strtoupper(substr($transformateur->nom_entreprise, 0, 2)) : '??',
            ]
        ], 200);
    }

    /**
     * Lister toutes les categories (route publique)
     */
    public function getCategories()
    {
        $categories = DB::table('categories')->get(['id', 'nom']);
        return response()->json(['categories' => $categories], 200);
    }

    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Non authentifie'], 401);
        }

        $transformateur = Transformateur::where('user_id', $user->id)->first();
        if (!$transformateur) {
            return response()->json(['message' => 'Profil transformateur non trouve'], 404);
        }

        $query = Produit::where('transformateur_id', $transformateur->id);

        if ($request->filled('categorie_id')) {
            $query->where('categorie_id', $request->categorie_id);
        }
        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        $produits = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['produits' => $produits], 200);
    }

    /**
     * Creer un nouveau produit
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Non authentifie'], 401);
        }

        $request->validate([
            'nom' => 'required|string|max:255',
            'categorie_id' => 'nullable|integer|exists:categories,id',
            'categorie_nom' => 'nullable|string|max:255',
            'prix_unitaire' => 'required|numeric|min:0',
            'prix_gros' => 'nullable|numeric|min:0',
            'mode_vente' => 'required|in:gros,detail,les_deux',
            'quantite_min_gros' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'stock' => 'nullable|integer|min:0',
            'unite_mesure' => 'nullable|string|max:50',
            'delai_livraison' => 'nullable|integer|min:0',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if (in_array($request->mode_vente, ['gros', 'les_deux'], true) && $request->prix_gros === null) {
            return response()->json(['message' => 'Le prix de gros est obligatoire pour ce mode de vente.'], 422);
        }

        $photosPath = null;
        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('produits', 'public');
            $photosPath = json_encode([$path]);
        }

        $transformateur = Transformateur::where('user_id', $user->id)->first();
        if (!$transformateur) {
            return response()->json(['message' => 'Profil transformateur non trouve'], 404);
        }

        $produit = Produit::create([
            'transformateur_id' => $transformateur->id,
            'categorie_id' => $request->categorie_id,
            'nom' => $request->nom,
            'description' => $request->description,
            'prix_unitaire' => $request->prix_unitaire,
            'prix_gros' => $request->prix_gros,
            'mode_vente' => $request->mode_vente,
            'quantite_min_gros' => $request->quantite_min_gros ?? 10,
            'stock' => $request->stock ?? 0,
            'unite_mesure' => $request->unite_mesure ?? 'kg',
            'delai_livraison' => $request->delai_livraison,
            'photos' => $photosPath,
            'statut' => 'actif',
        ]);

        // Publier sur Facebook uniquement si un vrai driver de queue est configuré (pas sync)
        // pour ne jamais bloquer la réponse HTTP
        if (config('queue.default') !== 'sync') {
            PublierProduitSurFacebook::dispatch($produit->id);
        }

        return response()->json([
            'message' => 'Produit publie avec succes.',
            'produit' => $produit,
        ], 201);
    }

    /**
     * Mettre a jour un produit
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Non authentifie'], 401);
        }

        $transformateur = Transformateur::where('user_id', $user->id)->first();
        $produit = Produit::where('id', $id)->where('transformateur_id', $transformateur->id)->firstOrFail();

        $request->validate([
            'nom' => 'required|string|max:255',
            'categorie_id' => 'nullable|integer|exists:categories,id',
            'prix_unitaire' => 'required|numeric|min:0',
            'prix_gros' => 'nullable|numeric|min:0',
            'mode_vente' => 'required|in:gros,detail,les_deux',
            'quantite_min_gros' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
            'stock' => 'nullable|integer|min:0',
            'unite_mesure' => 'nullable|string|max:50',
            'delai_livraison' => 'nullable|integer|min:0',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        if (in_array($request->mode_vente, ['gros', 'les_deux'], true) && $request->prix_gros === null) {
            return response()->json(['message' => 'Le prix de gros est obligatoire pour ce mode de vente.'], 422);
        }

        if ($request->hasFile('photo')) {
            if ($produit->photos) {
                $paths = is_array($produit->photos) ? $produit->photos : json_decode($produit->photos, true);
                foreach ((array) $paths as $p) {
                    Storage::disk('public')->delete($p);
                }
            }
            $path = $request->file('photo')->store('produits', 'public');
            $produit->photos = json_encode([$path]);
            $produit->save();
        }

        $produit->update([
            'categorie_id' => $request->categorie_id,
            'nom' => $request->nom,
            'description' => $request->description,
            'prix_unitaire' => $request->prix_unitaire,
            'prix_gros' => $request->prix_gros,
            'mode_vente' => $request->mode_vente,
            'quantite_min_gros' => $request->quantite_min_gros ?? 10,
            'stock' => $request->stock ?? 0,
            'unite_mesure' => $request->unite_mesure ?? 'kg',
            'delai_livraison' => $request->delai_livraison,
        ]);

        return response()->json([
            'message' => 'Produit mis a jour avec succes.',
            'produit' => $produit,
        ], 200);
    }

    /**
     * Supprimer un produit
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $transformateur = Transformateur::where('user_id', $user->id)->first();
        $produit = Produit::where('id', $id)->where('transformateur_id', $transformateur->id)->firstOrFail();

        if ($produit->photos) {
            $paths = is_array($produit->photos) ? $produit->photos : json_decode($produit->photos, true);
            foreach ((array) $paths as $p) {
                Storage::disk('public')->delete($p);
            }
        }

        $produit->delete();

        return response()->json(['message' => 'Produit supprime.'], 200);
    }
}
