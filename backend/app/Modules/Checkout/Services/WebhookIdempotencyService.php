<?php

declare(strict_types=1);

namespace App\Modules\Checkout\Services;

use App\Modules\Checkout\Models\WebhookEvent;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Cache\Factory as CacheFactory;
use Illuminate\Contracts\Config\Repository as ConfigRepository;
use Illuminate\Database\UniqueConstraintViolationException;

final readonly class WebhookIdempotencyService
{
    public function __construct(
        private CacheFactory $cache,
        private ConfigRepository $config,
    ) {}

    /**
     * Atomically claim an incoming webhook event across distributed workers.
     * Returns null when the event was already processed or is currently in-flight.
     *
     * @param array<string, mixed> $decodedPayload
     */
    public function claimEvent(
        string $provider,
        string $idempotencyKey,
        string $eventType,
        string $rawPayload,
        array $decodedPayload,
    ): ?WebhookEvent {
        $lockSeconds = (int) $this->config->get('decaspark.webhooks.lock_seconds', 30);
        $lockKey = "decaspark:webhook_lock:{$provider}:{$idempotencyKey}";

        $lock = $this->cache->store('redis')->lock($lockKey, $lockSeconds);
        if (! $lock->get()) {
            return null;
        }

        try {
            $existing = WebhookEvent::query()
                ->where('provider', $provider)
                ->where('idempotency_key', $idempotencyKey)
                ->first();

            if ($existing !== null && in_array($existing->status, ['processing', 'processed', 'ignored'], true)) {
                return null;
            }

            if ($existing !== null && $existing->status === 'failed') {
                $existing->update([
                    'status' => 'processing',
                    'error_message' => null,
                ]);

                return $existing;
            }

            return WebhookEvent::query()->create([
                'provider' => $provider,
                'idempotency_key' => $idempotencyKey,
                'event_type' => $eventType,
                'payload_hash' => hash('sha256', $rawPayload),
                'payload' => $decodedPayload,
                'status' => 'processing',
            ]);
        } catch (UniqueConstraintViolationException) {
            return null;
        } finally {
            $lock->release();
        }
    }

    public function markProcessed(WebhookEvent $event, string $status = 'processed'): void
    {
        $event->update([
            'status' => $status,
            'processed_at' => CarbonImmutable::now('UTC'),
            'error_message' => null,
        ]);
    }

    public function markFailed(WebhookEvent $event, string $reason): void
    {
        $event->update([
            'status' => 'failed',
            'error_message' => mb_substr($reason, 0, 2_000),
        ]);
    }
}
