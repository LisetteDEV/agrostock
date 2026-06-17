<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    protected $table = 'produits';

    const UPDATED_AT = null;

    protected $fillable = [
        'transformateur_id',
        'categorie_id',
        'nom',
        'description',
        'prix_unitaire',
        'prix_gros',
        'mode_vente',
        'quantite_min_gros',
        'stock',
        'unite_mesure',
        'delai_livraison',
        'photos',
        'statut',
    ];

    protected $casts = [
        'photos' => 'array', // Si photos est un JSON
        'quantite_min_gros' => 'integer',
    ];

    public function transformateur()
    {
        return $this->belongsTo(Transformateur::class, 'transformateur_id');
    }
}

