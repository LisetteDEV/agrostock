<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BonRetrait extends Model
{
    protected $table = 'bons_retraits';

    protected $fillable = [
        'commande_id',
        'code',
        'otp_code',
        'otp_expires_at',
        'validated_at',
        'zone_retrait',
        'gps_link',
        'instructions',
    ];

    protected $casts = [
        'otp_expires_at' => 'datetime',
        'validated_at' => 'datetime',
    ];

    public function commande()
    {
        return $this->belongsTo(Commande::class, 'commande_id');
    }
}
