<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Acheteur;
use App\Models\Transformateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // The frontend sends 'email' but it can be either email or telephone
        $user = User::where('email', $request->email)
                    ->orWhere('telephone', $request->email)
                    ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Aucun compte trouve avec cet identifiant. Veuillez vous inscrire d\'abord.'
            ], 404);
        }

        if ($user->statut === 'suspendu') {
            return response()->json([
                'message' => 'Votre compte est suspendu. Contactez l\'administrateur.'
            ], 403);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Mot de passe incorrect.'
            ], 401);
        }

        // Ensure we load the relations so frontend knows the role details
        if ($user->role === 'acheteur') {
            $user->load('acheteur');
        } else if ($user->role === 'transformateur') {
            $user->load('transformateur');
        }
        // Generer le jeton Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Connexion reussie',
            'user' => $user,
            'token' => $token
        ], 200);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|in:acheteur,transformateur',
            'nom_complet' => 'required|string|max:100',
            'email' => 'required|string|email|max:150|unique:users',
            'telephone' => 'required|string|max:20',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $user = User::create([
                'nom_complet' => $request->nom_complet,
                'email' => $request->email,
                'telephone' => $request->telephone,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'statut' => $request->role === 'transformateur' ? 'inactif' : 'actif',
            ]);

            if ($request->role === 'acheteur') {
                $acheteurValidator = Validator::make($request->all(), [
                    'type_acheteur' => 'required|in:grossiste,detaillant,restaurateur,particulier',
                    'entreprise' => 'nullable|string|max:150',
                    'departement' => 'nullable|string|max:100',
                    'commune' => 'nullable|string|max:100',
                ]);

                if ($acheteurValidator->fails()) {
                    DB::rollBack();
                    return response()->json(['errors' => $acheteurValidator->errors()], 422);
                }

                Acheteur::create([
                    'user_id' => $user->id,
                    'type_acheteur' => $request->type_acheteur,
                    'nom_entreprise' => $request->entreprise,
                    'departement' => $request->departement,
                    'commune' => $request->commune,
                ]);
            } else if ($request->role === 'transformateur') {
                $transValidator = Validator::make($request->all(), [
                    'entreprise' => 'required|string|max:150',
                    'type_entreprise' => 'required|in:pme,cooperative,artisan',
                    'categorie' => 'required|string', 
                    'description' => 'nullable|string',
                    'mode_vente' => 'required|in:gros,detail,les_deux',
                    'departement' => 'required|string|max:100',
                    'commune' => 'required|string|max:100',
                    'numero_ifu' => 'required|string|max:50',
                    'pj_identite' => 'required|file|image|max:5120',
                    'pj_atelier' => 'required|file|image|max:5120',
                    'pj_rccm' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
                ]);

                if ($transValidator->fails()) {
                    DB::rollBack();
                    return response()->json(['errors' => $transValidator->errors()], 422);
                }

                // Handle uploads
                $pathIdentite = $request->file('pj_identite')->store('documents/identite', 'public');
                $pathAtelier = $request->file('pj_atelier')->store('documents/ateliers', 'public');
                $pathRccm = $request->hasFile('pj_rccm') ? $request->file('pj_rccm')->store('documents/rccm', 'public') : null;

                Transformateur::create([
                    'user_id' => $user->id,
                    'nom_entreprise' => $request->entreprise,
                    'type_entreprise' => $request->type_entreprise,
                    'description' => "Categories: " . $request->categorie . ". " . $request->description,
                    'numero_ifu' => $request->numero_ifu,
                    'departement' => $request->departement,
                    'commune' => $request->commune,
                    'mode_vente' => $request->mode_vente,
                    'piece_identite' => $pathIdentite,
                    'registre_commerce' => $pathRccm,
                    'photo_atelier' => $pathAtelier,
                    'statut_verification' => 'en_attente',
                ]);
            }

            DB::commit();

            // Generer le jeton Sanctum pour la confirmation de l'inscription
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Inscription reussie',
                'user' => $user,
                'token' => $token
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Erreur lors de l\'inscription', 'message' => $e->getMessage()], 500);
        }
    }


    public function updateTransformateurDocuments(Request $request)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'transformateur') {
            return response()->json(['message' => 'Reserve aux transformateurs'], 403);
        }

        $transformateur = Transformateur::where('user_id', $user->id)->first();
        if (!$transformateur) {
            return response()->json(['message' => 'Profil transformateur introuvable'], 404);
        }

        $validator = Validator::make($request->all(), [
            'piece_identite' => 'nullable|file|image|max:5120',
            'photo_atelier' => 'nullable|file|image|max:5120',
            'registre_commerce' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!$request->hasFile('piece_identite') && !$request->hasFile('photo_atelier') && !$request->hasFile('registre_commerce')) {
            return response()->json(['message' => 'Aucun fichier fourni'], 422);
        }

        if ($request->hasFile('piece_identite')) {
            $transformateur->piece_identite = $request->file('piece_identite')->store('documents/identite', 'public');
        }

        if ($request->hasFile('photo_atelier')) {
            $transformateur->photo_atelier = $request->file('photo_atelier')->store('documents/ateliers', 'public');
        }

        if ($request->hasFile('registre_commerce')) {
            $transformateur->registre_commerce = $request->file('registre_commerce')->store('documents/rccm', 'public');
        }

        $transformateur->save();
        $user->load('transformateur');

        return response()->json([
            'message' => 'Documents mis a jour',
            'user' => $user,
            'documents' => [
                'piece_identite' => $transformateur->piece_identite,
                'photo_atelier' => $transformateur->photo_atelier,
                'registre_commerce' => $transformateur->registre_commerce,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        if ($request->user()?->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Deconnexion reussie'], 200);
    }
}







