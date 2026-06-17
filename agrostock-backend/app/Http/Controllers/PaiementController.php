<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PaiementController extends Controller
{
    /**
     * Simulation de paiement Mobile Money.
     * En cas de succès, délègue la création des commandes au CommandeController.
     */
    public function simuler(Request $request)
    {
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
            'numero_mobile' => 'required|string|min:8',
            'simulate_echec' => 'nullable|boolean',
        ]);

        if ((bool) $request->input('simulate_echec', false) === true) {
            return response()->json([
                'message' => 'Paiement refusé (simulation).',
                'status' => 'failed',
            ], 402);
        }

        // Simulation acceptée : on poursuit avec la création de commande + escrow
        return app(CommandeController::class)->store($request);
    }
}


