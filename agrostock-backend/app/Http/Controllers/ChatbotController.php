<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatbotController extends Controller
{
    public function message(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|min:2|max:1200',
            'role' => 'nullable|in:visiteur,acheteur,transformateur',
        ]);

        $role = $validated['role'] ?? 'visiteur';
        $userMessage = trim($validated['message']);

        $localReply = $this->localReply($role, $userMessage);
        if ($localReply !== null) {
            return response()->json([
                'reply' => $localReply,
                'source' => 'local',
            ]);
        }

        $apiKey = env('GROK_API_KEY');
        if (!$apiKey) {
            return response()->json([
                'reply' => $this->fallbackReply($role),
                'source' => 'fallback',
            ]);
        }

        $apiUrl = env('GROK_API_URL', 'https://api.x.ai/v1/chat/completions');
        $model = env('GROK_MODEL', 'grok-2-latest');

        try {
            $response = Http::timeout(18)
                ->withToken($apiKey)
                ->acceptJson()
                ->post($apiUrl, [
                    'model' => $model,
                    'temperature' => 0.3,
                    'messages' => [
                        ['role' => 'system', 'content' => $this->systemPrompt($role)],
                        ['role' => 'user', 'content' => $userMessage],
                    ],
                ]);

            if (!$response->ok()) {
                return response()->json([
                    'reply' => $this->fallbackReply($role),
                    'source' => 'fallback',
                ]);
            }

            $content = data_get($response->json(), 'choices.0.message.content');
            if (is_array($content)) {
                $content = collect($content)
                    ->map(fn ($chunk) => is_array($chunk) ? ($chunk['text'] ?? '') : (string) $chunk)
                    ->implode(' ');
            }

            $reply = trim((string) $content);
            if ($reply === '') {
                $reply = $this->fallbackReply($role);
            }

            return response()->json([
                'reply' => $reply,
                'source' => 'grok',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'reply' => $this->fallbackReply($role),
                'source' => 'fallback',
            ]);
        }
    }

    private function localReply(string $role, string $message): ?string
    {
        $q = mb_strtolower($message);

        if ($this->containsAny($q, ['numero vendeur', 'contact vendeur', 'telephone vendeur', 'whatsapp vendeur'])) {
            return "Je ne peux pas partager les coordonnees d'un vendeur. Pour proteger les transactions, passez par la commande sur AgroStock.";
        }

        if ($this->containsAny($q, ['payer', 'paiement', 'mobile money'])) {
            return "Le paiement se fait via le parcours de paiement simule de la plateforme. AgroBot ne traite pas les paiements directement, mais je peux vous guider etape par etape jusqu'a la validation.";
        }

        if ($this->containsAny($q, ['livraison', 'livreur', 'gozem', 'bon de retrait', 'otp'])) {
            return "Livraison: l'acheteur choisit soit un livreur propre (bon de retrait + code + OTP), soit livraison a domicile selon disponibilite. Le vendeur ne remet pas la commande sans validation systeme.";
        }

        if ($role === 'visiteur') {
            if ($this->containsAny($q, ['comment fonctionne', 'fonctionnement', 'agrostock'])) {
                return "AgroStock relie transformateurs et acheteurs: vous consultez le catalogue, passez commande, suivez le statut et confirmez la reception. Les echanges sont traces sur la plateforme.";
            }
            if ($this->containsAny($q, ['inscription', 'inscrire', 'creer compte'])) {
                return "Pour vous inscrire: cliquez sur Inscription, choisissez votre role (acheteur ou transformateur), remplissez le formulaire puis validez. Ensuite connectez-vous pour utiliser votre dashboard.";
            }
            if ($this->containsAny($q, ['produit', 'catalogue', 'disponible'])) {
                return "Les produits disponibles sont visibles dans Catalogue. Vous pouvez filtrer, ouvrir la fiche produit, puis commander selon le mode detail ou gros.";
            }
        }

        if ($role === 'acheteur') {
            if ($this->containsAny($q, ['trouver', 'chercher', 'catalogue', 'produit'])) {
                return "Pour trouver un produit: allez dans Catalogue, utilisez la recherche et les categories, puis ouvrez la fiche produit pour voir prix, stock et mode de vente.";
            }
            if ($this->containsAny($q, ['statut', 'commande', 'suivi'])) {
                return "Le statut de commande se suit dans votre dashboard: en attente, confirmee, en cours de livraison, livree, puis recue. En cas de blocage, ouvrez un litige depuis la commande.";
            }
            if ($this->containsAny($q, ['avis', 'noter', 'commentaire'])) {
                return "Pour laisser un avis: ouvrez votre dashboard acheteur, section avis, choisissez le transformateur, notez et publiez votre commentaire.";
            }
        }

        if ($role === 'transformateur') {
            if ($this->containsAny($q, ['ajouter produit', 'publier', 'nouveau produit'])) {
                return "Pour ajouter un produit: dashboard transformateur > Mes produits > Ajouter. Renseignez nom, categorie, prix, stock, mode de vente, image puis enregistrez.";
            }
            if ($this->containsAny($q, ['verification', 'verifie', 'compte'])) {
                return "La verification du compte passe par vos documents entreprise (piece identite, certificat, photo atelier). Une fois valides, votre badge de verification apparait.";
            }
            if ($this->containsAny($q, ['stock', 'mettre a jour stock', 'quantite'])) {
                return "Pour mettre a jour le stock: dashboard transformateur > Mes produits > Modifier. Ajustez la quantite disponible puis sauvegardez.";
            }
            if ($this->containsAny($q, ['commande', 'gestion commande'])) {
                return "La gestion des commandes se fait dans dashboard transformateur > Commandes: confirmer, passer en livraison, puis marquer livree selon le processus.";
            }
        }

        return null;
    }

    private function containsAny(string $text, array $needles): bool
    {
        foreach ($needles as $needle) {
            if (str_contains($text, $needle)) {
                return true;
            }
        }

        return false;
    }

    private function systemPrompt(string $role): string
    {
        $roleInstructions = match ($role) {
            'acheteur' => "Tu aides un acheteur inscrit: trouver un produit, comprendre le statut d'une commande, probleme de paiement, avis, livraison.",
            'transformateur' => "Tu aides un transformateur: ajouter un produit, verification du compte, gestion des commandes, mise a jour du stock.",
            default => "Tu aides un visiteur non inscrit: fonctionnement de la plateforme, inscription, produits, paiement Mobile Money, livraison.",
        };

        return "Tu es AgroBot, assistant virtuel de AgroStock Benin. Reponds en francais simple, clair et professionnel. " .
            "Reste concis (4 a 8 lignes max), concret, et oriente action. " .
            $roleInstructions . " " .
            "Regles strictes: ne jamais donner les coordonnees d'un vendeur, ne pas traiter de paiement, ne pas passer de commande, " .
            "et ne pas remplacer l'admin pour les litiges. " .
            "Si la demande sort du perimetre, explique la limite et propose l'etape correcte sur AgroStock.";
    }

    private function fallbackReply(string $role): string
    {
        return match ($role) {
            'acheteur' => "Je suis AgroBot. Je peux vous aider pour le catalogue, le statut de commande, le paiement et la livraison. Dites-moi ce que vous cherchez exactement.",
            'transformateur' => "Je suis AgroBot. Je peux vous guider pour publier un produit, gerer vos commandes et mettre a jour votre stock. Quelle etape voulez-vous faire ?",
            default => "Je suis AgroBot. Je peux expliquer comment fonctionne AgroStock, l'inscription, le paiement Mobile Money et la livraison. Quelle est votre question ?",
        };
    }
}
