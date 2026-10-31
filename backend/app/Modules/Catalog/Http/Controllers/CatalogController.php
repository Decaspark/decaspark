<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Http\Controllers;

use App\Modules\Catalog\Services\CachedCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final readonly class CatalogController
{
    public function __construct(
        private CachedCatalogService $catalog,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $pillar = $request->query('pillar');
        $category = $request->query('category');

        $items = $this->catalog->listActiveCatalog(
            is_string($pillar) ? $pillar : null,
            is_string($category) ? $category : null,
        );

        return new JsonResponse(['data' => $items], 200);
    }

    public function show(string $slug): JsonResponse
    {
        $product = $this->catalog->findProductBySlug($slug);
        if ($product === null) {
            return new JsonResponse(['error' => 'Product not found.'], 404);
        }

        return new JsonResponse(['data' => $product], 200);
    }
}
