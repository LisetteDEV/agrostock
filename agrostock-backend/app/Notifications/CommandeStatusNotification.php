<?php

namespace App\Notifications;

use App\Models\Commande;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

use Illuminate\Contracts\Queue\ShouldQueue;

class CommandeStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Commande $commande,
        public string $title,
        public string $message
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject($this->title)
            ->greeting('Bonjour,')
            ->line($this->message)
            ->line('Commande: ' . ($this->commande->numero ?: ('CMD-' . str_pad((string) $this->commande->id, 4, '0', STR_PAD_LEFT))))
            ->line('Statut actuel: ' . $this->commande->statut)
            ->line('Montant total: ' . number_format((float) $this->commande->montant_total, 0, ',', ' ') . ' FCFA')
            ->line('Merci d’utiliser AgroStock.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'commande_id' => $this->commande->id,
            'commande_numero' => $this->commande->numero,
            'statut' => $this->commande->statut,
            'montant_total' => $this->commande->montant_total,
        ];
    }
}
