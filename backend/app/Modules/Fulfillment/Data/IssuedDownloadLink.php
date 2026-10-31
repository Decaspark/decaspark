<?php

declare(strict_types=1);

namespace App\Modules\Fulfillment\Data;

use Carbon\CarbonImmutable;

final readonly class IssuedDownloadLink
{
    public function __construct(
        public string $licenseId,
        public string $signedUrl,
        public CarbonImmutable $expiresAt,
        public int $maxDownloads,
        public int $remainingDownloads,
    ) {}
}
