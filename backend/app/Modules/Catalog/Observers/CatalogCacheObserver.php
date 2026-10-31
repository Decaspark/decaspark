<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Observers;

use App\Modules\Catalog\Services\CachedCatalogService;
use Illuminate\Database\Eloquent\Model;

final readonly class CatalogCacheObserver
{
    public function __construct(
        private CachedCatalogService $catalogCache,
    ) {}

    public function saved(Model $model): void
    {
        $this->catalogCache->bumpCatalogVersion();
    }

    public function deleted(Model $model): void
    {
        $this->catalogCache->bumpCatalogVersion();
    }
}
