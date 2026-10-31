<?php

declare(strict_types=1);

namespace App\Modules\Fulfillment\Notifications;

use App\Modules\Fulfillment\Models\ServiceIntake;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

final class ServiceIntakeInitializedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly ServiceIntake $intake,
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
        $portalUrl = rtrim((string) config('decaspark.frontend_url'), '/') . "/intake/{$this->intake->workspace_slug}";

        return (new MailMessage())
            ->subject('Decaspark Studio — Your Technical Intake Workspace Is Ready')
            ->greeting('Welcome to Decaspark.')
            ->line("Your dedicated service engagement workspace ({$this->intake->workspace_slug}) has been initialized.")
            ->action('Complete Technical Discovery Intake', $portalUrl)
            ->line('Our engineering and editorial leads review intake submissions within one business day.');
    }
}
