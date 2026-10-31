<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Models;

use App\Modules\Catalog\Enums\FulfillmentType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class ProductVariant extends Model
{
    use HasUuids;

    /**
     * Never expose private bucket names, object keys, or internal checksums in API payloads.
     *
     * @var list<string>
     */
    protected $hidden = [
        'storage_disk',
        'storage_object_key',
        'checksum_sha256',
    ];

    protected $fillable = [
        'product_id',
        'sku',
        'name',
        'fulfillment_type',
        'price_cents',
        'currency',
        'storage_disk',
        'storage_object_key',
        'download_filename',
        'checksum_sha256',
        'file_size_bytes',
        'weight_grams',
        'stock_quantity',
        'default_seat_count',
        'attributes',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fulfillment_type' => FulfillmentType::class,
            'price_cents' => 'integer',
            'file_size_bytes' => 'integer',
            'weight_grams' => 'integer',
            'stock_quantity' => 'integer',
            'default_seat_count' => 'integer',
            'attributes' => 'array',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
