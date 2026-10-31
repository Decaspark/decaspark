<?php

declare(strict_types=1);

namespace App\Modules\Fulfillment\Services;

use App\Modules\Catalog\Enums\FulfillmentType;
use App\Modules\Checkout\Models\Order;
use App\Modules\Checkout\Models\OrderLineItem;
use App\Modules\Fulfillment\Data\IssuedDownloadLink;
use App\Modules\Fulfillment\Exceptions\DownloadAccessDeniedException;
use App\Modules\Fulfillment\Models\DigitalLicense;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Config\Repository as ConfigRepository;
use Illuminate\Contracts\Filesystem\Factory as FilesystemFactory;
use Illuminate\Contracts\Routing\UrlGenerator;
use Illuminate\Database\ConnectionInterface;
use Symfony\Component\HttpFoundation\HeaderUtils;
use Symfony\Component\HttpFoundation\StreamedResponse;

final readonly class DigitalFulfillmentService
{
    public function __construct(
        private ConnectionInterface $db,
        private FilesystemFactory $filesystem,
        private UrlGenerator $urlGenerator,
        private ConfigRepository $config,
    ) {}

    /**
     * Mint or refresh an isolated, time-limited, count-capped download license for a paid line item.
     */
    public function issueForLineItem(Order $order, OrderLineItem $lineItem, ?string $teamLicenseId = null): IssuedDownloadLink
    {
        if ($lineItem->fulfillment_type !== FulfillmentType::DigitalDownload) {
            throw new DownloadAccessDeniedException('Line item is not eligible for digital download fulfillment.', 422);
        }

        $plainToken = bin2hex(random_bytes(32)); // 256 bits of CSPRNG entropy (64 hex chars)
        $tokenHash = hash('sha256', $plainToken);

        $ttlHours = (int) $this->config->get('decaspark.digital_delivery.token_ttl_hours', 24);
        $maxDownloads = (int) $this->config->get('decaspark.digital_delivery.default_max_downloads', 3);
        $expiresAt = CarbonImmutable::now('UTC')->addHours($ttlHours);

        /** @var DigitalLicense $license */
        $license = $this->db->transaction(function () use ($order, $lineItem, $teamLicenseId, $tokenHash, $maxDownloads, $expiresAt): DigitalLicense {
            $license = DigitalLicense::query()->updateOrCreate(
                ['order_line_item_id' => $lineItem->id],
                [
                    'order_id' => $order->id,
                    'user_id' => $order->user_id,
                    'product_id' => $lineItem->product_id,
                    'product_variant_id' => $lineItem->product_variant_id,
                    'team_license_id' => $teamLicenseId,
                    'download_token_hash' => $tokenHash,
                    'download_count' => 0,
                    'max_downloads' => $maxDownloads,
                    'expiration_timestamp' => $expiresAt,
                    'revoked_at' => null,
                ],
            );

            $lineItem->update(['fulfillment_state' => 'generated']);

            return $license;
        });

        $signedUrl = $this->urlGenerator->temporarySignedRoute(
            'api.v1.downloads.stream',
            $expiresAt,
            ['token' => $plainToken],
        );

        return new IssuedDownloadLink(
            licenseId: $license->id,
            signedUrl: $signedUrl,
            expiresAt: $expiresAt,
            maxDownloads: $maxDownloads,
            remainingDownloads: $maxDownloads,
        );
    }

    /**
     * Re-issue a fresh signed link and rotated token for an existing unrevoked license owner.
     */
    public function rotateLink(DigitalLicense $license): IssuedDownloadLink
    {
        if ($license->revoked_at !== null) {
            throw new DownloadAccessDeniedException('This digital license has been revoked.', 403);
        }

        $plainToken = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $plainToken);
        $ttlHours = (int) $this->config->get('decaspark.digital_delivery.token_ttl_hours', 24);
        $expiresAt = CarbonImmutable::now('UTC')->addHours($ttlHours);

        $license->update([
            'download_token_hash' => $tokenHash,
            'download_count' => 0,
            'expiration_timestamp' => $expiresAt,
        ]);

        $signedUrl = $this->urlGenerator->temporarySignedRoute(
            'api.v1.downloads.stream',
            $expiresAt,
            ['token' => $plainToken],
        );

        return new IssuedDownloadLink(
            licenseId: $license->id,
            signedUrl: $signedUrl,
            expiresAt: $expiresAt,
            maxDownloads: $license->max_downloads,
            remainingDownloads: $license->max_downloads,
        );
    }

    /**
     * Validate token + quotas atomically, close the DB transaction, then stream chunks from private object storage.
     */
    public function streamProtectedAsset(string $plainToken, string $clientIp, ?string $userAgent): StreamedResponse
    {
        if (strlen($plainToken) !== 64 || ! ctype_xdigit($plainToken)) {
            throw new DownloadAccessDeniedException('Malformed download token.', 403);
        }

        $tokenHash = hash('sha256', strtolower($plainToken));
        $now = CarbonImmutable::now('UTC');

        /**
         * Phase 1: Atomic row-locked quota claim inside PostgreSQL.
         * Completing the DB transaction before network streaming avoids holding PgBouncer/Postgres locks on slow links.
         *
         * @var array{license_id: string, disk: string, object_key: string, filename: string, size_bytes: int|null} $target
         */
        $target = $this->db->transaction(function () use ($tokenHash, $now, $clientIp, $userAgent): array {
            /** @var DigitalLicense|null $license */
            $license = DigitalLicense::query()
                ->with('variant')
                ->where('download_token_hash', $tokenHash)
                ->lockForUpdate()
                ->first();

            if ($license === null) {
                throw new DownloadAccessDeniedException('Invalid download token.', 404);
            }

            if ($license->revoked_at !== null) {
                throw new DownloadAccessDeniedException('This license has been revoked.', 403);
            }

            if ($license->expiration_timestamp->lessThanOrEqualTo($now)) {
                throw new DownloadAccessDeniedException('Download link has expired.', 410);
            }

            if ($license->download_count >= $license->max_downloads) {
                throw new DownloadAccessDeniedException('Maximum download count reached for this token.', 429);
            }

            $variant = $license->variant;
            if ($variant === null || empty($variant->storage_object_key)) {
                throw new DownloadAccessDeniedException('Digital asset storage reference is unavailable.', 500);
            }

            $license->update([
                'download_count' => $license->download_count + 1,
                'last_downloaded_at' => $now,
                'last_downloaded_ip' => $clientIp,
            ]);

            $this->db->table('digital_download_audit_logs')->insert([
                'digital_license_id' => $license->id,
                'ip_address' => $clientIp,
                'user_agent' => $userAgent !== null ? mb_substr($userAgent, 0, 512) : null,
                'bytes_streamed' => $variant->file_size_bytes ?? 0,
                'downloaded_at' => $now,
            ]);

            $defaultDisk = (string) $this->config->get('decaspark.digital_delivery.default_disk', 'r2_private');
            $safeFilename = $variant->download_filename ?: basename($variant->storage_object_key);

            return [
                'license_id' => $license->id,
                'disk' => $variant->storage_disk ?: $defaultDisk,
                'object_key' => $variant->storage_object_key,
                'filename' => $safeFilename,
                'size_bytes' => $variant->file_size_bytes,
            ];
        });

        // Phase 2: Open isolated private stream (Cloudflare R2 / S3 / private vault) without exposing bucket URLs
        $storage = $this->filesystem->disk($target['disk']);
        $readStream = $storage->readStream($target['object_key']);

        if (! is_resource($readStream)) {
            throw new DownloadAccessDeniedException('Unable to open upstream asset stream.', 502);
        }

        $chunkBytes = max(8_192, (int) $this->config->get('decaspark.digital_delivery.stream_chunk_bytes', 65_536));
        $disposition = HeaderUtils::makeDisposition(
            HeaderUtils::DISPOSITION_ATTACHMENT,
            $target['filename'],
        );

        $headers = [
            'Content-Type' => 'application/octet-stream',
            'Content-Disposition' => $disposition,
            'Cache-Control' => 'private, no-store, no-cache, must-revalidate',
            'Pragma' => 'no-cache',
            'X-Content-Type-Options' => 'nosniff',
            'X-Robots-Tag' => 'noindex, nofollow, noarchive',
            'X-Accel-Buffering' => 'no', // Disable Nginx proxy buffering for constant-memory chunk pass-through
        ];

        if ($target['size_bytes'] !== null && $target['size_bytes'] > 0) {
            $headers['Content-Length'] = (string) $target['size_bytes'];
        }

        return new StreamedResponse(static function () use ($readStream, $chunkBytes): void {
            try {
                while (! feof($readStream)) {
                    $buffer = fread($readStream, $chunkBytes);
                    if ($buffer === false) {
                        break;
                    }

                    echo $buffer;

                    if (ob_get_level() > 0) {
                        ob_flush();
                    }
                    flush();

                    if (connection_aborted() === 1) {
                        break;
                    }
                }
            } finally {
                fclose($readStream);
            }
        }, 200, $headers);
    }
}
