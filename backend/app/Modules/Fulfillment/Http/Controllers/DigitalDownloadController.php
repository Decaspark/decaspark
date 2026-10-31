<?php

declare(strict_types=1);

namespace App\Modules\Fulfillment\Http\Controllers;

use App\Modules\Fulfillment\Exceptions\DownloadAccessDeniedException;
use App\Modules\Fulfillment\Http\Requests\RegenerateDownloadLinkRequest;
use App\Modules\Fulfillment\Models\DigitalLicense;
use App\Modules\Fulfillment\Services\DigitalFulfillmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final readonly class DigitalDownloadController
{
    public function __construct(
        private DigitalFulfillmentService $fulfillmentService,
    ) {}

    /**
     * Signed, rate-limited, chunked download stream isolated from private object storage.
     */
    public function stream(Request $request, string $token): Response
    {
        if (! $request->hasValidSignature()) {
            return new JsonResponse(['error' => 'Invalid or expired signed download URL.'], 403);
        }

        try {
            return $this->fulfillmentService->streamProtectedAsset(
                plainToken: $token,
                clientIp: (string) ($request->ip() ?? '0.0.0.0'),
                userAgent: $request->userAgent(),
            );
        } catch (DownloadAccessDeniedException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], $exception->httpStatus);
        }
    }

    /**
     * Issue a fresh 24-hour signed URL for an authenticated license holder.
     */
    public function regenerate(RegenerateDownloadLinkRequest $request): JsonResponse
    {
        $licenseId = (string) $request->validated('license_id');
        $actorId = (string) $request->user()?->getAuthIdentifier();

        /** @var DigitalLicense|null $license */
        $license = DigitalLicense::query()->find($licenseId);
        if ($license === null || $license->user_id !== $actorId) {
            return new JsonResponse(['error' => 'Digital license not found.'], 404);
        }

        try {
            $issued = $this->fulfillmentService->rotateLink($license);

            return new JsonResponse([
                'license_id' => $issued->licenseId,
                'download_url' => $issued->signedUrl,
                'expires_at' => $issued->expiresAt->toIso8601String(),
                'max_downloads' => $issued->maxDownloads,
            ], 200);
        } catch (DownloadAccessDeniedException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], $exception->httpStatus);
        }
    }
}
