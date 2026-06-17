<?php

namespace App\Http\Controllers;

use App\Models\ArticleBlog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ArticleBlogController extends Controller
{
    /**
     * Obtenir tous les articles publiés (pour le site public)
     */
    public function indexPublic()
    {
        $articles = ArticleBlog::with('auteur')
            ->where('statut', 'publie')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($article) {
                return $this->formatArticle($article);
            });

        return response()->json(['articles' => $articles]);
    }

    /**
     * Obtenir un article public par son slug ou id
     */
    public function showPublic($slug)
    {
        $article = ArticleBlog::with('auteur')
            ->where('slug', $slug)
            ->where('statut', 'publie')
            ->firstOrFail();

        // Incrementer le nombre de vues
        $article->increment('vues');

        return response()->json(['article' => $this->formatArticle($article)]);
    }

    /**
     * Obtenir tous les articles (Admin)
     */
    public function indexAdmin()
    {
        $articles = ArticleBlog::with('auteur')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($article) {
                return $this->formatArticle($article);
            });

        return response()->json(['articles' => $articles]);
    }

    /**
     * Créer un article (Admin)
     */
    public function store(Request $request)
    {
        $request->validate([
            'titre' => 'required|string|max:255',
            'contenu' => 'required|string',
            'extrait' => 'nullable|string|max:500',
            'categorie' => 'required|string|max:255',
            'statut' => 'required|in:brouillon,publie',
            'image' => 'nullable|image|max:2048'
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('blog', 'public');
        }

        $article = ArticleBlog::create([
            'user_id' => $request->user()->id,
            'titre' => $request->titre,
            'contenu' => $request->contenu,
            'extrait' => $request->extrait ?? Str::limit(strip_tags($request->contenu), 150),
            'image_couverture' => $imagePath,
            'categorie' => $request->categorie,
            'statut' => $request->statut,
            'vues' => 0,
        ]);

        return response()->json(['message' => 'Article créé avec succès', 'article' => $this->formatArticle($article)], 201);
    }

    /**
     * Mettre à jour un article (Admin)
     */
    public function update(Request $request, $id)
    {
        $article = ArticleBlog::findOrFail($id);

        $request->validate([
            'titre' => 'required|string|max:255',
            'contenu' => 'required|string',
            'extrait' => 'nullable|string|max:500',
            'categorie' => 'required|string|max:255',
            'statut' => 'required|in:brouillon,publie',
            'image' => 'nullable|image|max:2048'
        ]);

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('blog', 'public');
            $article->image_couverture = $imagePath;
        }

        $article->update([
            'titre' => $request->titre,
            'contenu' => $request->contenu,
            'extrait' => $request->extrait ?? Str::limit(strip_tags($request->contenu), 150),
            'categorie' => $request->categorie,
            'statut' => $request->statut,
        ]);

        return response()->json(['message' => 'Article mis à jour avec succès', 'article' => $this->formatArticle($article)]);
    }

    /**
     * Supprimer un article (Admin)
     */
    public function destroy($id)
    {
        $article = ArticleBlog::findOrFail($id);
        $article->delete();
        return response()->json(['message' => 'Article supprimé avec succès']);
    }

    private function formatArticle($article)
    {
        return [
            'id' => $article->id,
            'titre' => $article->titre,
            'slug' => $article->slug,
            'contenu' => $article->contenu,
            'extrait' => $article->extrait,
            'image_couverture' => $article->image_couverture ? url('storage/' . $article->image_couverture) : null,
            'categorie' => $article->categorie,
            'statut' => $article->statut,
            'vues' => $article->vues,
            'auteur' => $article->auteur ? $article->auteur->nom_complet : 'Admin',
            'date' => $article->created_at->format('d M Y'),
        ];
    }
}
