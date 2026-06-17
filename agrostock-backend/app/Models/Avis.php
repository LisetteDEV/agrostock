<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Avis extends Model
{
    const UPDATED_AT = null; // La table n'a pas de colonne updated_at
    protected $table = 'avis';

    protected $fillable = [
        'acheteur_id',
        'transformateur_id',
        'commande_id',
        'note',
        'commentaire',
        'signale',
        'statut',
    ];

    public function acheteur()
    {
        return $this->belongsTo(User::class, 'acheteur_id');
    }

    public function transformateur()
    {
        return $this->belongsTo(Transformateur::class, 'transformateur_id');
    }
}
