<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Portefeuille extends Model
{
    protected $fillable = [
        'user_id',
        'solde_disponible',
        'solde_bloque',
    ];

    protected $casts = [
        'solde_disponible' => 'decimal:2',
        'solde_bloque' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
