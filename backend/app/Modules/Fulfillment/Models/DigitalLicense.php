<?php

declare(strict_types=1);

namespace App\Modules\Fulfillment\Models;

use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductVariant;
use App\Modules\Checkout\Models\Order;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class DigitalLicense extends Model
{
    use HasUuids;

    protected $hidden = [
        'download_token_hash',
    ];

    protected $fillable = [
        'order_id',
        'order_line_item_id',
        'user_id',
        'product_id',
        'product_variant_id',
        'team_license_id',
        'download_token_hash',
        'download_count',
        'max_downloads',
        'expiration_timestamp',
        'revoked_at',
        'last_downloaded_at',
        'last_downloaded_ip',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'download_count' => 'integer',
            'max_downloads' => 'integer',
            'expiration_timestamp' => 'immutable_datetime',
            'revoked_at' => 'immutable_datetime',
            'last_downloaded_at' => 'immutable_datetime',
        ];
    }

    public function isUsable(): bool
    {
        if ($this->revoked_at !== null) {
            return false;
        }

        if ($this->expiration_timestamp->isPast()) {
            return false;
        }

        return $this->download_count < $this->max_downloads;
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
