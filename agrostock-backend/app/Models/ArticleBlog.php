<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ArticleBlog extends Model
{
    protected $table = 'articles_blog';

    protected $fillable = [
        'user_id',
        'titre',
        'slug',
        'contenu',
        'extrait',
        'image_couverture',
        'categorie',
        'statut',
        'vues'
    ];

    public function auteur()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($article) {
            if (empty($article->slug)) {
                $article->slug = Str::slug($article->titre) . '-' . uniqid();
            }
        });
    }
}
