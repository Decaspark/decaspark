<?php

declare(strict_types=1);

namespace App\Modules\Checkout\Models;

use App\Modules\Checkout\Enums\OrderFulfillmentState;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

final class Order extends Model
{
    use HasUuids;

    protected $fillable = [
        'order_number',
        'user_id',
        'customer_email',
        'organization_name',
        'checkout_session_id',
        'payment_provider',
        'payment_intent_id',
        'payment_status',
        'fulfillment_state',
        'currency',
        'subtotal_cents',
        'tax_cents',
        'shipping_cents',
        'discount_cents',
        'total_cents',
        'tax_parameters',
        'shipping_parameters',
        'shipping_carrier',
        'shipping_tracking_number',
        'paid_at',
        'shipped_at',
        'fulfilled_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fulfillment_state' => OrderFulfillmentState::class,
            'subtotal_cents' => 'integer',
            'tax_cents' => 'integer',
            'shipping_cents' => 'integer',
            'discount_cents' => 'integer',
            'total_cents' => 'integer',
            'tax_parameters' => 'array',
            'shipping_parameters' => 'array',
            'paid_at' => 'immutable_datetime',
            'shipped_at' => 'immutable_datetime',
            'fulfilled_at' => 'immutable_datetime',
        ];
    }

    /**
     * @return HasMany<OrderLineItem, $this>
     */
    public function lineItems(): HasMany
    {
        return $this->hasMany(OrderLineItem::class);
    }
}
