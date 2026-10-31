<?php

declare(strict_types=1);

namespace App\Modules\Checkout\Models;

use App\Modules\Catalog\Enums\FulfillmentType;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductVariant;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class OrderLineItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_variant_id',
        'sku_snapshot',
        'title_snapshot',
        'fulfillment_type',
        'quantity',
        'unit_price_cents',
        'tax_cents',
        'line_total_cents',
        'fulfillment_state',
        'metadata',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fulfillment_type' => FulfillmentType::class,
            'quantity' => 'integer',
            'unit_price_cents' => 'integer',
            'tax_cents' => 'integer',
            'line_total_cents' => 'integer',
            'metadata' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsTo<ProductVariant, $this>
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
