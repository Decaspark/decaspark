<?php

declare(strict_types=1);

namespace App\Modules\Fulfillment\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

final class ServiceIntake extends Model
{
    use HasUuids;

    protected $fillable = [
        'order_id',
        'order_line_item_id',
        'client_user_id',
        'organization_name',
        'contact_email',
        'service_category',
        'workspace_slug',
        'status',
        'intake_context',
        'onboarding_sent_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'intake_context' => 'array',
            'onboarding_sent_at' => 'immutable_datetime',
        ];
    }
}
