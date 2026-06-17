<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $table = 'contact_messages';

    protected $fillable = [
        'nom',
        'email',
        'telephone',
        'sujet',
        'message',
        'statut',
        'ip_address',
    ];
}
