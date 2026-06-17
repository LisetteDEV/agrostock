<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParametrePlateforme extends Model
{
    protected $table = 'parametres_plateforme';

    protected $fillable = [
        'commission_taux',
        'notification_nouvelle_commande',
        'notification_litige',
        'notification_paiement',
        'notification_email',
        'notification_sms',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'commission_taux' => 'float',
            'notification_nouvelle_commande' => 'boolean',
            'notification_litige' => 'boolean',
            'notification_paiement' => 'boolean',
            'notification_email' => 'boolean',
            'notification_sms' => 'boolean',
        ];
    }
}
