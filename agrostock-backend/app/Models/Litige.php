<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Litige extends Model
{
    protected $table = 'litiges';

    protected $fillable = [
        'commande_id',
        'acheteur_id',
        'transformateur_id',
        'resolved_by',
        'statut',
        'motif',
        'description',
        'resolution_type',
        'resolution_note',
        'opened_at',
        'resolved_at',
    ];

    protected $casts = [
        'opened_at' => 'datetime',
        'resolved_at' => 'datetime',
    ];

    public function commande()
    {
        return $this->belongsTo(Commande::class, 'commande_id');
    }

    public function acheteur()
    {
        return $this->belongsTo(Acheteur::class, 'acheteur_id');
    }

    public function transformateur()
    {
        return $this->belongsTo(Transformateur::class, 'transformateur_id');
    }

    public function resolvedByUser()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
