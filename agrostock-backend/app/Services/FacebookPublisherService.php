<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FacebookPublisherService
{
    protected string $pageId;
    protected string $accessToken;
    protected string $apiVersion = 'v19.0';

    public function __construct()
    {
        $this->pageId      = config('services.facebook.page_id');
        $this->accessToken = config('services.facebook.access_token');
    }

    /**
     * Publie un post texte + image sur la Page Facebook AgroStock.
     *
     * @param string $message   Le texte du post (généré par PostGeneratorService)
     * @param string|null $imageUrl URL publique de la photo du produit (optionnelle)
     * @return array ['success' => bool, 'post_id' => string|null, 'error' => string|null]
     */
    public function publier(string $message, ?string $imageUrl = null): array
    {
        try {
            $baseUrl = "https://graph.facebook.com/{$this->apiVersion}/{$this->pageId}";

            if ($imageUrl) {
                // Détecter si l'URL est locale (Facebook ne peut pas télécharger depuis localhost/127.0.0.1)
                $host = parse_url($imageUrl, PHP_URL_HOST);
                if (in_array($host, ['localhost', '127.0.0.1'])) {
                    // Fallback absolu et léger (Unsplash bloque parfois les robots Facebook)
                    $imageUrl = 'https://dummyimage.com/800x600/1ab273/ffffff.jpg&text=Produit+Agrostock';
                }

                // Publication avec photo
                $response = Http::withoutVerifying()->timeout(15)->post("{$baseUrl}/photos", [
                    'url'          => $imageUrl,
                    'caption'      => $message,
                    'access_token' => $this->accessToken,
                ]);
            } else {
                // Publication texte uniquement
                $response = Http::withoutVerifying()->timeout(15)->post("{$baseUrl}/feed", [
                    'message'      => $message,
                    'access_token' => $this->accessToken,
                ]);
            }

            $data = $response->json();

            if ($response->successful() && isset($data['id'])) {
                Log::info('[AgroStock] Post Facebook publié avec succès.', ['post_id' => $data['id']]);
                return ['success' => true, 'post_id' => $data['id'], 'error' => null];
            }

            $erreur = $data['error']['message'] ?? 'Erreur inconnue de l\'API Facebook.';
            Log::error('[AgroStock] Échec publication Facebook.', ['response' => $data]);
            return ['success' => false, 'post_id' => null, 'error' => $erreur];

        } catch (\Exception $e) {
            Log::error('[AgroStock] Exception lors de la publication Facebook.', ['message' => $e->getMessage()]);
            return ['success' => false, 'post_id' => null, 'error' => $e->getMessage()];
        }
    }
}
