<?php

declare(strict_types=1);

namespace App\Modules\Licensing\Services;

use App\Modules\Checkout\Models\Order;
use App\Modules\Checkout\Models\OrderLineItem;
use App\Modules\Licensing\Models\TeamLicense;
use App\Modules\Licensing\Models\TeamLicenseSeat;
use Carbon\CarbonImmutable;
use Illuminate\Database\ConnectionInterface;
use RuntimeException;

final readonly class TeamLicenseService
{
    public function __construct(
        private ConnectionInterface $db,
    ) {}

    /**
     * Provision an organization multi-seat license and allocate seat #1 to the purchasing owner.
     *
     * @return array{license: TeamLicense, plain_license_key: string}
     */
    public function provisionFromOrderLineItem(Order $order, OrderLineItem $lineItem): array
    {
        if ($order->user_id === null) {
            throw new RuntimeException('Team licenses require an authenticated owner_user_id.');
        }

        $variant = $lineItem->variant;
        $seatsPerUnit = max(2, (int) ($variant?->default_seat_count ?? 10));
        $seatLimit = $seatsPerUnit * max(1, $lineItem->quantity);

        $randomSecret = strtoupper(bin2hex(random_bytes(16)));
        $plainKey = 'DST-' . substr($randomSecret, 0, 8) . '-' . substr($randomSecret, 8, 8) . '-' . substr($randomSecret, 16, 16);
        $prefix = substr($plainKey, 0, 12);
        $keyHash = hash('sha256', $plainKey);
        $now = CarbonImmutable::now('UTC');

        /** @var TeamLicense $teamLicense */
        $teamLicense = $this->db->transaction(function () use ($order, $lineItem, $seatLimit, $keyHash, $prefix, $now): TeamLicense {
            $existing = TeamLicense::query()
                ->where('order_line_item_id', $lineItem->id)
                ->lockForUpdate()
                ->first();

            if ($existing !== null) {
                return $existing;
            }

            $license = TeamLicense::query()->create([
                'order_id' => $order->id,
                'order_line_item_id' => $lineItem->id,
                'owner_user_id' => $order->user_id,
                'product_id' => $lineItem->product_id,
                'organization_name' => $order->organization_name ?: $order->customer_email,
                'license_key_hash' => $keyHash,
                'license_key_prefix' => $prefix,
                'seat_limit' => $seatLimit,
                'seats_allocated' => 1,
                'status' => 'active',
                'expires_at' => $now->addYear(),
                'metadata' => ['sku' => $lineItem->sku_snapshot],
            ]);

            TeamLicenseSeat::query()->create([
                'team_license_id' => $license->id,
                'member_user_id' => $order->user_id,
                'member_email' => strtolower($order->customer_email),
                'role' => 'owner',
                'status' => 'active',
                'invited_at' => $now,
                'activated_at' => $now,
            ]);

            $lineItem->update(['fulfillment_state' => 'generated']);

            return $license;
        });

        return [
            'license' => $teamLicense,
            'plain_license_key' => $plainKey,
        ];
    }

    /**
     * Allocate a team seat under row-level lock so concurrent invites can never exceed seat_limit.
     */
    public function allocateSeat(string $teamLicenseId, string $actorUserId, string $memberEmail, string $role = 'member'): TeamLicenseSeat
    {
        $normalizedEmail = strtolower(trim($memberEmail));

        return $this->db->transaction(static function () use ($teamLicenseId, $actorUserId, $normalizedEmail, $role): TeamLicenseSeat {
            /** @var TeamLicense|null $license */
            $license = TeamLicense::query()->whereKey($teamLicenseId)->lockForUpdate()->first();

            if ($license === null) {
                throw new RuntimeException('Team license not found.');
            }

            if ($license->owner_user_id !== $actorUserId) {
                throw new RuntimeException('Only the organization license owner may allocate seats.');
            }

            if ($license->status !== 'active') {
                throw new RuntimeException('Team license is not active.');
            }

            if ($license->seats_allocated >= $license->seat_limit) {
                throw new RuntimeException('All available seats in this team license have been allocated.');
            }

            $alreadyAssigned = TeamLicenseSeat::query()
                ->where('team_license_id', $license->id)
                ->whereRaw('lower(member_email) = ?', [$normalizedEmail])
                ->where('status', '!=', 'revoked')
                ->exists();

            if ($alreadyAssigned) {
                throw new RuntimeException('A seat is already assigned to this email address.');
            }

            $seat = TeamLicenseSeat::query()->create([
                'team_license_id' => $license->id,
                'member_email' => $normalizedEmail,
                'role' => in_array($role, ['admin', 'member'], true) ? $role : 'member',
                'status' => 'invited',
                'invited_at' => CarbonImmutable::now('UTC'),
            ]);

            $license->increment('seats_allocated');

            return $seat;
        });
    }
}
