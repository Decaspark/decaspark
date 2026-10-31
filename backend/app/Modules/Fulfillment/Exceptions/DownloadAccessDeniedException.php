<?php

declare(strict_types=1);

namespace App\Modules\Fulfillment\Exceptions;

use RuntimeException;

final class DownloadAccessDeniedException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly int $httpStatus = 403,
    ) {
        parent::__construct($message);
    }
}
