<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'user_id', 'nom_entreprise', 'logo', 'type_entreprise', 'description', 
    'numero_ifu', 'departement', 'commune', 'latitude', 'longitude', 
    'mode_vente', 'quantite_min_commande', 'piece_identite', 
    'registre_commerce', 'photo_atelier', 'statut_verification', 
    'motif_rejet', 'verifie_par', 'verifie_le'
])]
class Transformateur extends Model
{
    use HasFactory;

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
