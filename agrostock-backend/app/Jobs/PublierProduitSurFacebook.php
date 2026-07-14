<?php

namespace App\Jobs;

use App\Models\Produit;
use App\Models\Transformateur;
use App\Services\FacebookPublisherService;
use App\Services\PostGeneratorService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PublierProduitSurFacebook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Nombre de tentatives max en cas d'échec.
     */
    public int $tries = 3;

    /**
     * Délai entre les tentatives (en secondes).
     */
    public int $backoff = 60;

    public function __construct(
        protected int $produitId
    ) {}

    /**
     * Exécution du Job en arrière-plan.
     */
    public function handle(PostGeneratorService $generator, FacebookPublisherService $publisher): void
    {
        // 1. Récupérer le produit
        $produit = Produit::find($this->produitId);
        if (!$produit) {
            Log::warning("[AgroStock Facebook Job] Produit introuvable.", ['produit_id' => $this->produitId]);
            return;
        }

        // 2. Récupérer le transformateur
        $transformateur = Transformateur::find($produit->transformateur_id);
        if (!$transformateur) {
            Log::warning("[AgroStock Facebook Job] Transformateur introuvable.", ['produit_id' => $this->produitId]);
            return;
        }

        // 3. Construire le lien public vers le profil du transformateur
        $frontendUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');
        $lienBoutique = "{$frontendUrl}/transformateur/{$transformateur->id}";

        // 4. Récupérer l'image principale du produit (si disponible)
        $imageUrl = null;
        if ($produit->photos) {
            $photos = is_string($produit->photos) ? json_decode($produit->photos, true) : $produit->photos;
            if (is_array($photos) && !empty($photos)) {
                $imageUrl = url('storage/' . $photos[0]);
            }
        }

        // 5. Générer le texte du post via templates dynamiques
        $texte = $generator->generer(
            nomProduit:    $produit->nom,
            nomEntreprise: $transformateur->nom_entreprise,
            prixUnitaire:  $produit->prix_unitaire,
            lienBoutique:  $lienBoutique
        );

        // 6. Publier sur la page Facebook AgroStock
        $resultat = $publisher->publier($texte, $imageUrl);

        if ($resultat['success']) {
            Log::info("[AgroStock Facebook Job] ✅ Produit publié sur Facebook.", [
                'produit'  => $produit->nom,
                'post_id'  => $resultat['post_id'],
            ]);
        } else {
            Log::error("[AgroStock Facebook Job] ❌ Échec publication.", [
                'produit' => $produit->nom,
                'erreur'  => $resultat['error'],
            ]);
        }
    }
}
