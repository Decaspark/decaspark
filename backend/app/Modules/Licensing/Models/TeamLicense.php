<?php

declare(strict_types=1);

namespace App\Modules\Licensing\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class TeamLicense extends Model
{
    use HasUuids;

    protected $hidden = [
        'license_key_hash',
    ];

    protected $fillable = [
        'order_id',
        'order_line_item_id',
        'owner_user_id',
        'product_id',
        'organization_name',
        'license_key_hash',
        'license_key_prefix',
        'seat_limit',
        'seats_allocated',
        'status',
        'expires_at',
        'metadata',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'seat_limit' => 'integer',
            'seats_allocated' => 'integer',
            'expires_at' => 'immutable_datetime',
            'metadata' => 'array',
        ];
    }

    /**
     * @return HasMany<TeamLicenseSeat, $this>
     */
    public function seats(): HasMany
    {
        return $this->hasMany(TeamLicenseSeat::class);
    }
}
