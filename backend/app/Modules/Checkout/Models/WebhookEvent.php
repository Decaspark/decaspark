<?php

declare(strict_types=1);

namespace App\Modules\Checkout\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class WebhookEvent extends Model
{
    use HasUuids;

    protected $fillable = [
        'provider',
        'idempotency_key',
        'event_type',
        'payload_hash',
        'payload',
        'status',
        'processed_at',
        'error_message',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'processed_at' => 'immutable_datetime',
        ];
    }
}
