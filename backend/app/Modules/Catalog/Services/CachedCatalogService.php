<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Services;

use App\Modules\Catalog\Models\Product;
use Illuminate\Contracts\Cache\Factory as CacheFactory;
use Illuminate\Contracts\Config\Repository as ConfigRepository;

final readonly class CachedCatalogService
{
    private const string VERSION_KEY = 'decaspark:catalog:version';

    public function __construct(
        private CacheFactory $cache,
        private ConfigRepository $config,
    ) {}

    /**
     * Fetch active pillar/category catalog from Redis using stale-while-revalidate semantics.
     *
     * @return list<array<string, mixed>>
     */
    public function listActiveCatalog(?string $pillar = null, ?string $categorySlug = null): array
    {
        $storeName = (string) $this->config->get('decaspark.catalog_cache.store', 'redis');
        $freshTtl = (int) $this->config->get('decaspark.catalog_cache.ttl_seconds', 3_600);
        $staleTtl = (int) $this->config->get('decaspark.catalog_cache.stale_ttl_seconds', 86_400);

        $store = $this->cache->store($storeName);
        $version = (int) $store->get(self::VERSION_KEY, 1);

        $normalizedPillar = $pillar !== null ? strtolower(trim($pillar)) : 'all';
        $normalizedCategory = $categorySlug !== null ? strtolower(trim($categorySlug)) : 'all';
        $cacheKey = "decaspark:catalog:v{$version}:list:{$normalizedPillar}:{$normalizedCategory}";

        /** @var list<array<string, mixed>> $catalog */
        $catalog = $store->flexible($cacheKey, [$freshTtl, $staleTtl], static function () use ($pillar, $categorySlug): array {
            $query = Product::query()
                ->select([
                    'id',
                    'slug',
                    'title',
                    'pillar',
                    'category_slug',
                    'delivery_kind',
                    'summary',
                    'metadata',
                ])
                ->where('is_active', true)
                ->with([
                    'variants' => static function ($variantQuery): void {
                        $variantQuery
                            ->select([
                                'id',
                                'product_id',
                                'sku',
                                'name',
                                'fulfillment_type',
                                'price_cents',
                                'currency',
                                'default_seat_count',
                                'attributes',
                            ])
                            ->where('is_active', true)
                            ->orderBy('price_cents');
                    },
                ])
                ->orderBy('title');

            if ($pillar !== null && $pillar !== '') {
                $query->where('pillar', strtolower(trim($pillar)));
            }

            if ($categorySlug !== null && $categorySlug !== '') {
                $query->where('category_slug', strtolower(trim($categorySlug)));
            }

            return $query->get()->toArray();
        });

        return $catalog;
    }

    /**
     * Fetch a single product detail envelope by slug with O(1) versioned Redis lookup.
     *
     * @return array<string, mixed>|null
     */
    public function findProductBySlug(string $slug): ?array
    {
        $cleanSlug = strtolower(trim($slug));
        if ($cleanSlug === '') {
            return null;
        }

        $storeName = (string) $this->config->get('decaspark.catalog_cache.store', 'redis');
        $freshTtl = (int) $this->config->get('decaspark.catalog_cache.ttl_seconds', 3_600);
        $staleTtl = (int) $this->config->get('decaspark.catalog_cache.stale_ttl_seconds', 86_400);

        $store = $this->cache->store($storeName);
        $version = (int) $store->get(self::VERSION_KEY, 1);
        $cacheKey = "decaspark:catalog:v{$version}:slug:{$cleanSlug}";

        /** @var array<string, mixed>|null $product */
        $product = $store->flexible($cacheKey, [$freshTtl, $staleTtl], static function () use ($cleanSlug): ?array {
            $model = Product::query()
                ->where('slug', $cleanSlug)
                ->where('is_active', true)
                ->with(['variants' => static fn ($q) => $q->where('is_active', true)->orderBy('price_cents')])
                ->first();

            return $model?->toArray();
        });

        return $product;
    }

    /**
     * Atomically invalidate all catalog cache keys in O(1) without Redis KEYS/SCAN blocking.
     */
    public function bumpCatalogVersion(): void
    {
        $storeName = (string) $this->config->get('decaspark.catalog_cache.store', 'redis');
        $store = $this->cache->store($storeName);

        if (! $store->has(self::VERSION_KEY)) {
            $store->forever(self::VERSION_KEY, 2);

            return;
        }

        $store->increment(self::VERSION_KEY);
    }
}
