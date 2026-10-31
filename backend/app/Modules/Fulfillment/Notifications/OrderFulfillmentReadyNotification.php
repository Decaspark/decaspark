<?php

declare(strict_types=1);

namespace App\Modules\Fulfillment\Notifications;

use App\Modules\Checkout\Models\Order;
use App\Modules\Fulfillment\Data\IssuedDownloadLink;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class OrderFulfillmentReadyNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @param list<IssuedDownloadLink> $downloadLinks
     */
    public function __construct(
        public readonly Order $order,
        public readonly array $downloadLinks,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage())
            ->subject("Your Decaspark Order ({$this->order->order_number}) Is Ready")
            ->greeting('Thank you for your order.')
            ->line("Order {$this->order->order_number} has been verified and provisioned.");

        foreach ($this->downloadLinks as $link) {
            $mail->action('Download Digital Asset', $link->signedUrl)
                ->line("Link expires {$link->expiresAt->toIso8601String()} (max {$link->maxDownloads} downloads).");
        }

        return $mail;
    }
}
