<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['user_id', 'type_acheteur', 'nom_entreprise', 'departement', 'commune'])]
class Acheteur extends Model
{
    use HasFactory;

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
