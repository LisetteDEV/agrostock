<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LigneCommande extends Model
{
    protected $fillable = [
        'commande_id',
        'produit_id',
        'quantite',
        'mode_achat',
        'prix_unitaire',
        'sous_total'
    ];

    protected $casts = [
        'prix_unitaire' => 'decimal:2',
        'sous_total' => 'decimal:2',
    ];

    public function produit()
    {
        return $this->belongsTo(Produit::class, 'produit_id');
    }
}

