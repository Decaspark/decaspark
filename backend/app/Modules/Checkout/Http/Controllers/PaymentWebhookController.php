<?php

declare(strict_types=1);

namespace App\Modules\Checkout\Http\Controllers;

use App\Modules\Checkout\Jobs\ProcessVerifiedOrderPaymentJob;
use App\Modules\Checkout\Security\WebhookSignatureVerifier;
use App\Modules\Checkout\Services\WebhookIdempotencyService;
use Illuminate\Contracts\Bus\Dispatcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final readonly class PaymentWebhookController
{
    private const array SUPPORTED_PAYMENT_EVENTS = [
        'checkout.session.completed',
        'payment_intent.succeeded',
        'sale.succeeded',
    ];

    public function __construct(
        private WebhookSignatureVerifier $signatureVerifier,
        private WebhookIdempotencyService $idempotencyService,
        private Dispatcher $bus,
    ) {}

    public function __invoke(Request $request, string $provider): JsonResponse
    {
        $normalizedProvider = strtolower(trim($provider));
        if (! in_array($normalizedProvider, ['stripe', 'gumroad'], true)) {
            return new JsonResponse(['error' => 'Unsupported payment provider.'], 404);
        }

        $rawPayload = $request->getContent();
        $signatureHeader = $normalizedProvider === 'stripe'
            ? $request->header('Stripe-Signature')
            : $request->header('X-Gumroad-Signature');

        if (! $this->signatureVerifier->verify($normalizedProvider, $rawPayload, $signatureHeader)) {
            return new JsonResponse(['error' => 'Invalid webhook signature.'], 401);
        }

        /** @var mixed $decoded */
        $decoded = json_decode($rawPayload, true);
        if (! is_array($decoded)) {
            return new JsonResponse(['error' => 'Invalid JSON payload.'], 422);
        }

        $idempotencyKey = $this->extractIdempotencyKey($normalizedProvider, $request, $decoded);
        $eventType = $this->extractEventType($normalizedProvider, $decoded);

        if ($idempotencyKey === '') {
            return new JsonResponse(['error' => 'Missing event idempotency identifier.'], 422);
        }

        $claimedEvent = $this->idempotencyService->claimEvent(
            provider: $normalizedProvider,
            idempotencyKey: $idempotencyKey,
            eventType: $eventType,
            rawPayload: $rawPayload,
            decodedPayload: $decoded,
        );

        // Duplicate delivery on upstream retry: acknowledge 200 OK so the provider stops retrying
        if ($claimedEvent === null) {
            return new JsonResponse(['status' => 'duplicate_ignored'], 200);
        }

        if (! in_array($eventType, self::SUPPORTED_PAYMENT_EVENTS, true)) {
            $this->idempotencyService->markProcessed($claimedEvent, 'ignored');

            return new JsonResponse(['status' => 'event_ignored'], 200);
        }

        $checkoutSessionId = $this->extractCheckoutSessionId($normalizedProvider, $decoded);
        if ($checkoutSessionId === '') {
            $this->idempotencyService->markFailed($claimedEvent, 'Missing checkout_session_id in payment payload.');

            return new JsonResponse(['error' => 'Unresolvable checkout reference.'], 422);
        }

        $paymentIntentId = $this->extractPaymentIntentId($normalizedProvider, $decoded);

        $this->bus->dispatch(
            (new ProcessVerifiedOrderPaymentJob(
                webhookEventId: $claimedEvent->id,
                checkoutSessionId: $checkoutSessionId,
                paymentIntentId: $paymentIntentId,
            ))->onQueue('payments'),
        );

        return new JsonResponse([
            'status' => 'accepted',
            'event_id' => $claimedEvent->id,
        ], 202);
    }

    /**
     * @param array<string, mixed> $decoded
     */
    private function extractIdempotencyKey(string $provider, Request $request, array $decoded): string
    {
        $headerKey = trim((string) $request->header('Idempotency-Key', ''));
        if ($headerKey !== '') {
            return mb_substr($headerKey, 0, 191);
        }

        $bodyId = match ($provider) {
            'stripe' => (string) ($decoded['id'] ?? ''),
            'gumroad' => (string) ($decoded['sale_id'] ?? $decoded['event_id'] ?? ''),
            default => '',
        };

        return mb_substr(trim($bodyId), 0, 191);
    }

    /**
     * @param array<string, mixed> $decoded
     */
    private function extractEventType(string $provider, array $decoded): string
    {
        return match ($provider) {
            'stripe' => trim((string) ($decoded['type'] ?? 'unknown')),
            'gumroad' => trim((string) ($decoded['resource_name'] ?? 'sale.succeeded')),
            default => 'unknown',
        };
    }

    /**
     * @param array<string, mixed> $decoded
     */
    private function extractCheckoutSessionId(string $provider, array $decoded): string
    {
        if ($provider === 'stripe') {
            $object = is_array($decoded['data']['object'] ?? null) ? $decoded['data']['object'] : [];
            $sessionId = (string) ($object['id'] ?? $object['metadata']['checkout_session_id'] ?? '');

            return trim($sessionId);
        }

        return trim((string) ($decoded['url_params']['checkout_session_id'] ?? $decoded['sale_id'] ?? ''));
    }

    /**
     * @param array<string, mixed> $decoded
     */
    private function extractPaymentIntentId(string $provider, array $decoded): ?string
    {
        if ($provider === 'stripe') {
            $object = is_array($decoded['data']['object'] ?? null) ? $decoded['data']['object'] : [];
            $intent = trim((string) ($object['payment_intent'] ?? ''));

            return $intent !== '' ? $intent : null;
        }

        $saleId = trim((string) ($decoded['sale_id'] ?? ''));

        return $saleId !== '' ? $saleId : null;
    }
}
