<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    protected $fillable = [
        'acheteur_id',
        'transformateur_id',
        'numero',
        'statut',
        'sous_total',
        'frais_livraison',
        'commission',
        'commission_rate',
        'remise_appliquee',
        'montant_total',
        'mode_achat',
        'mode_livraison',
        'logistique_mode',
        'adresse_livraison',
        'ville_livraison',
        'telephone_livraison',
        'payment_status',
        'escrow_status',
        'expires_at',
        'confirmed_at',
        'shipped_at',
        'delivered_at',
        'received_at',
    ];

    protected $casts = [
        'sous_total' => 'decimal:2',
        'frais_livraison' => 'decimal:2',
        'commission' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'remise_appliquee' => 'decimal:2',
        'montant_total' => 'decimal:2',
        'expires_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'received_at' => 'datetime',
    ];

    public function items()
    {
        return $this->hasMany(LigneCommande::class, 'commande_id');
    }

    public function acheteur()
    {
        return $this->belongsTo(Acheteur::class, 'acheteur_id');
    }

    public function transformateur()
    {
        return $this->belongsTo(Transformateur::class, 'transformateur_id');
    }

    public function litige()
    {
        return $this->hasOne(Litige::class, 'commande_id');
    }

    public function bonRetrait()
    {
        return $this->hasOne(BonRetrait::class, 'commande_id');
    }
}
