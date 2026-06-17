<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:120',
            'email' => 'required|email|max:160',
            'telephone' => 'nullable|string|max:30',
            'sujet' => 'required|string|max:180',
            'message' => 'required|string|min:10|max:4000',
        ]);

        ContactMessage::create([
            'nom' => $validated['nom'],
            'email' => $validated['email'],
            'telephone' => $validated['telephone'] ?? null,
            'sujet' => $validated['sujet'],
            'message' => $validated['message'],
            'statut' => 'nouveau',
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Votre message a ete envoye avec succes. Notre equipe vous repondra rapidement.',
        ], 201);
    }

    public function adminIndex(Request $request)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Acces refuse'], 403);
        }

        $messages = ContactMessage::query()
            ->orderByRaw("CASE WHEN statut = 'nouveau' THEN 0 ELSE 1 END")
            ->orderByDesc('created_at')
            ->get()
            ->map(function (ContactMessage $m) {
                return [
                    'id' => $m->id,
                    'nom' => $m->nom,
                    'email' => $m->email,
                    'telephone' => $m->telephone,
                    'sujet' => $m->sujet,
                    'message' => $m->message,
                    'statut' => $m->statut,
                    'date' => $m->created_at,
                ];
            });

        return response()->json([
            'messages' => $messages,
            'nouveaux' => ContactMessage::where('statut', 'nouveau')->count(),
            'total' => ContactMessage::count(),
        ]);
    }

    public function markAsHandled(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Acces refuse'], 403);
        }

        $message = ContactMessage::findOrFail($id);
        $message->update(['statut' => 'traite']);

        return response()->json([
            'message' => 'Message marque comme traite.',
            'contact_message' => [
                'id' => $message->id,
                'statut' => $message->statut,
            ],
        ]);
    }
}
