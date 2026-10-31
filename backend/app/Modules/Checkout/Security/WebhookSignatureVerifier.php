<?php

declare(strict_types=1);

namespace App\Modules\Checkout\Security;

use Illuminate\Contracts\Config\Repository as ConfigRepository;

final readonly class WebhookSignatureVerifier
{
    public function __construct(
        private ConfigRepository $config,
    ) {}

    public function verify(string $provider, string $rawPayload, ?string $signatureHeader): bool
    {
        if ($signatureHeader === null || $signatureHeader === '' || $rawPayload === '') {
            return false;
        }

        return match ($provider) {
            'stripe' => $this->verifyStripeSignature($rawPayload, $signatureHeader),
            'gumroad' => $this->verifyGumroadSignature($rawPayload, $signatureHeader),
            default => false,
        };
    }

    private function verifyStripeSignature(string $rawPayload, string $signatureHeader): bool
    {
        $secret = (string) $this->config->get('decaspark.webhooks.stripe.signing_secret', '');
        if ($secret === '') {
            return false;
        }

        $parts = explode(',', $signatureHeader);
        $timestamp = null;
        $signatures = [];

        foreach ($parts as $part) {
            [$key, $value] = array_pad(explode('=', trim($part), 2), 2, '');
            if ($key === 't' && ctype_digit($value)) {
                $timestamp = (int) $value;
            }
            if ($key === 'v1' && $value !== '') {
                $signatures[] = $value;
            }
        }

        if ($timestamp === null || $signatures === []) {
            return false;
        }

        $tolerance = (int) $this->config->get('decaspark.webhooks.stripe.tolerance_seconds', 300);
        if (abs(time() - $timestamp) > $tolerance) {
            return false;
        }

        $expectedHmac = hash_hmac('sha256', "{$timestamp}.{$rawPayload}", $secret);

        foreach ($signatures as $candidate) {
            if (hash_equals($expectedHmac, $candidate)) {
                return true;
            }
        }

        return false;
    }

    private function verifyGumroadSignature(string $rawPayload, string $signatureHeader): bool
    {
        $secret = (string) $this->config->get('decaspark.webhooks.gumroad.signing_secret', '');
        if ($secret === '') {
            return false;
        }

        $expectedHmac = hash_hmac('sha256', $rawPayload, $secret);

        return hash_equals($expectedHmac, trim($signatureHeader));
    }
}
