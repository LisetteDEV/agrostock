<?php

namespace App\Services;

class PostGeneratorService
{
    /**
     * Génère un texte de post Facebook dynamique à partir des infos du produit.
     *
     * @param string $nomProduit
     * @param string $nomEntreprise
     * @param string|int $prixUnitaire
     * @param string $lienBoutique
     * @return string
     */
    public function generer(string $nomProduit, string $nomEntreprise, $prixUnitaire, string $lienBoutique): string
    {
        $prix = number_format((float) $prixUnitaire, 0, ',', ' ') . ' FCFA';

        $templates = [
            "🌱 Nouveau sur AgroStock Bénin !\n\n"
            . "✅ {PRODUIT} vient d'être mis en ligne par {VENDEUR}.\n"
            . "💰 Prix : à partir de {PRIX} seulement.\n\n"
            . "C'est le moment de soutenir nos transformateurs locaux et de vous approvisionner en produits de qualité !\n\n"
            . "🛍️ Visitez la boutique directement ici 👇\n{LIEN}\n\n"
            . "#AgroStock #ProduitsLocaux #AgricultureBenin #Transformateurs",

            "📢 Mise à jour du catalogue AgroStock !\n\n"
            . "{VENDEUR} propose désormais : {PRODUIT} 🎉\n"
            . "💵 Disponible dès {PRIX}.\n\n"
            . "Achetez local, mangez sain. Découvrez tous les produits de cette boutique :\n"
            . "👉 {LIEN}\n\n"
            . "#AgroStockBenin #AcheterLocal #ProduitsBio #Benin",

            "✨ Découverte du jour sur AgroStock !\n\n"
            . "Notre partenaire {VENDEUR} vient de publier un nouveau produit :\n"
            . "🥗 {PRODUIT} — à partir de {PRIX}\n\n"
            . "Qualité garantie, traçabilité assurée. Commandez directement depuis la plateforme :\n"
            . "🔗 {LIEN}\n\n"
            . "#AgroStock #Qualite #TransformateursBenin #Agriculture",

            "🏪 Un nouveau produit vous attend sur AgroStock !\n\n"
            . "{PRODUIT} — proposé par {VENDEUR}\n"
            . "💲 Prix unitaire : {PRIX}\n\n"
            . "Des produits locaux, frais et transformés avec soin, livrés où vous le souhaitez.\n"
            . "Cliquez sur le lien pour accéder à la boutique :\n"
            . "👇 {LIEN}\n\n"
            . "#AgroStockBenin #Agrobusiness #NouveauProduit #Benin",

            "🌾 AgroStock connecte les Béninois aux meilleurs transformateurs locaux !\n\n"
            . "Aujourd'hui, {VENDEUR} publie : {PRODUIT}\n"
            . "💰 À partir de {PRIX} — Qualité locale, prix juste.\n\n"
            . "Ne manquez pas cette opportunité ! Rendez-vous sur la boutique :\n"
            . "➡️ {LIEN}\n\n"
            . "#AgroStock #LocalFood #BeninAgriculture #Transformateurs",
        ];

        // Sélection aléatoire d'un template
        $template = $templates[array_rand($templates)];

        // Remplacement des variables
        $texte = str_replace(
            ['{PRODUIT}', '{VENDEUR}', '{PRIX}', '{LIEN}'],
            [$nomProduit, $nomEntreprise, $prix, $lienBoutique],
            $template
        );

        return $texte;
    }
}
