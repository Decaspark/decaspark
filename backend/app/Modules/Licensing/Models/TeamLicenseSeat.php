<?php

declare(strict_types=1);

namespace App\Modules\Licensing\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class TeamLicenseSeat extends Model
{
    use HasUuids;

    protected $fillable = [
        'team_license_id',
        'member_user_id',
        'member_email',
        'role',
        'status',
        'invited_at',
        'activated_at',
        'revoked_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'invited_at' => 'immutable_datetime',
            'activated_at' => 'immutable_datetime',
            'revoked_at' => 'immutable_datetime',
        ];
    }

    /**
     * @return BelongsTo<TeamLicense, $this>
     */
    public function teamLicense(): BelongsTo
    {
        return $this->belongsTo(TeamLicense::class);
    }
}
