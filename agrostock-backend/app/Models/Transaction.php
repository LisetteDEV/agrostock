<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'commande_id',
        'from_user_id',
        'to_user_id',
        'reference',
        'type',
        'operateur',
        'numero_masked',
        'montant',
        'statut',
        'meta',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'meta' => 'array',
    ];

    public function commande()
    {
        return $this->belongsTo(Commande::class, 'commande_id');
    }

    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toUser()
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }
}
