<?php

namespace App\Http\Controllers;

use App\Models\ParametrePlateforme;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ParametresController extends Controller
{
    private function getOrCreatePlatformSettings(): ParametrePlateforme
    {
        return ParametrePlateforme::firstOrCreate(
            ['id' => 1],
            [
                'commission_taux' => 10.00,
                'notification_nouvelle_commande' => true,
                'notification_litige' => true,
                'notification_paiement' => true,
                'notification_email' => true,
                'notification_sms' => false,
            ]
        );
    }

    /**
     * Obtenir les parametres/infos de l'admin connecte
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Acces refuse'], 403);
        }

        $settings = $this->getOrCreatePlatformSettings();

        return response()->json([
            'nom_complet' => $user->nom_complet,
            'email' => $user->email,
            'nom_plateforme' => 'AgroStock',
            'contact' => 'admin@agrostock.bj',
            'settings' => [
                'commission_taux' => $settings->commission_taux,
                'notification_nouvelle_commande' => $settings->notification_nouvelle_commande,
                'notification_litige' => $settings->notification_litige,
                'notification_paiement' => $settings->notification_paiement,
                'notification_email' => $settings->notification_email,
                'notification_sms' => $settings->notification_sms,
            ],
        ]);
    }

    /**
     * Mettre a jour les infos generales (nom, email)
     */
    public function updateGenerales(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Acces refuse'], 403);
        }

        $request->validate([
            'nom_complet' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        $user->update([
            'nom_complet' => $request->nom_complet,
            'email' => $request->email,
        ]);

        return response()->json(['message' => 'Informations mises a jour avec succes.']);
    }

    /**
     * Mettre a jour les commissions plateforme
     */
    public function updateCommissions(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Acces refuse'], 403);
        }

        $request->validate([
            'commission_taux' => 'required|numeric|min:0|max:100',
        ]);

        $settings = $this->getOrCreatePlatformSettings();
        $settings->update([
            'commission_taux' => $request->commission_taux,
            'updated_by' => $user->id,
        ]);

        return response()->json([
            'message' => 'Commission mise a jour avec succes.',
            'settings' => [
                'commission_taux' => $settings->commission_taux,
            ],
        ]);
    }

    /**
     * Mettre a jour les notifications plateforme
     */
    public function updateNotifications(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Acces refuse'], 403);
        }

        $request->validate([
            'notification_nouvelle_commande' => 'required|boolean',
            'notification_litige' => 'required|boolean',
            'notification_paiement' => 'required|boolean',
            'notification_email' => 'required|boolean',
            'notification_sms' => 'required|boolean',
        ]);

        $settings = $this->getOrCreatePlatformSettings();
        $settings->update([
            'notification_nouvelle_commande' => $request->boolean('notification_nouvelle_commande'),
            'notification_litige' => $request->boolean('notification_litige'),
            'notification_paiement' => $request->boolean('notification_paiement'),
            'notification_email' => $request->boolean('notification_email'),
            'notification_sms' => $request->boolean('notification_sms'),
            'updated_by' => $user->id,
        ]);

        return response()->json([
            'message' => 'Preferences de notification mises a jour.',
            'settings' => [
                'notification_nouvelle_commande' => $settings->notification_nouvelle_commande,
                'notification_litige' => $settings->notification_litige,
                'notification_paiement' => $settings->notification_paiement,
                'notification_email' => $settings->notification_email,
                'notification_sms' => $settings->notification_sms,
            ],
        ]);
    }

    /**
     * Changer le mot de passe de l'admin
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Acces refuse'], 403);
        }

        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Le mot de passe actuel est incorrect.'], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Mot de passe change avec succes.']);
    }

    public function getTransformateurProfile(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'transformateur') {
            return response()->json(['message' => 'Acces refuse'], 403);
        }

        $user->load('transformateur');

        return response()->json([
            'nom_complet' => $user->nom_complet,
            'email' => $user->email,
            'telephone' => $user->telephone,
            'transformateur' => [
                'nom_entreprise' => $user->transformateur?->nom_entreprise,
                'departement' => $user->transformateur?->departement,
                'commune' => $user->transformateur?->commune,
                'description' => $user->transformateur?->description,
                'latitude' => $user->transformateur?->latitude,
                'longitude' => $user->transformateur?->longitude,
            ],
        ]);
    }

    public function updateTransformateurGenerales(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'transformateur') {
            return response()->json(['message' => 'Acces refuse'], 403);
        }

        $transformateur = $user->transformateur;
        if (!$transformateur) {
            return response()->json(['message' => 'Profil transformateur introuvable'], 404);
        }

        $request->validate([
            'nom_complet' => 'required|string|max:255',
            'telephone' => 'required|string|max:30',
            'nom_entreprise' => 'required|string|max:150',
            'departement' => 'nullable|string|max:100',
            'commune' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        $user->update([
            'nom_complet' => $request->nom_complet,
            'telephone' => $request->telephone,
        ]);

        $transformateur->update([
            'nom_entreprise' => $request->nom_entreprise,
            'departement' => $request->departement,
            'commune' => $request->commune,
            'description' => $request->description,
            'latitude' => $request->filled('latitude') ? $request->latitude : null,
            'longitude' => $request->filled('longitude') ? $request->longitude : null,
        ]);

        $user->load('transformateur');

        return response()->json([
            'message' => 'Informations mises a jour avec succes.',
            'user' => $user,
        ]);
    }

    public function changeTransformateurPassword(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'transformateur') {
            return response()->json(['message' => 'Acces refuse'], 403);
        }

        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Le mot de passe actuel est incorrect.'], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Mot de passe change avec succes.']);
    }
}




