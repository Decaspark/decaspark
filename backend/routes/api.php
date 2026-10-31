<?php

declare(strict_types=1);

use App\Modules\Catalog\Http\Controllers\CatalogController;
use App\Modules\Checkout\Http\Controllers\CheckoutController;
use App\Modules\Checkout\Http\Controllers\PaymentWebhookController;
use App\Modules\Fulfillment\Http\Controllers\DigitalDownloadController;
use App\Modules\Licensing\Http\Controllers\TeamLicenseController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(static function (): void {
    // 1. Redis-Cached Product Catalog
    Route::middleware('throttle:catalog-read')->group(static function (): void {
        Route::get('/catalog', [CatalogController::class, 'index'])->name('catalog.index');
        Route::get('/catalog/{slug}', [CatalogController::class, 'show'])
            ->where('slug', '[a-z0-9\-]+')
            ->name('catalog.show');
    });

    // 2. Hardened Checkout Session Creation
    Route::post('/checkout/sessions', [CheckoutController::class, 'store'])
        ->middleware('throttle:checkout-create')
        ->name('checkout.sessions.store');

    // 3. Idempotent Payment Webhooks (Stripe & Gumroad)
    Route::post('/webhooks/payments/{provider}', PaymentWebhookController::class)
        ->middleware('throttle:payment-webhooks')
        ->whereIn('provider', ['stripe', 'gumroad'])
        ->name('webhooks.payments');

    // 4. Signed, Chunk-Streamed Isolated Asset Delivery
    Route::get('/downloads/{token}', [DigitalDownloadController::class, 'stream'])
        ->middleware(['signed', 'throttle:download-stream'])
        ->where('token', '[a-fA-F0-9]{64}')
        ->name('downloads.stream');

    // 5. Authenticated Customer & Enterprise Team License Endpoints
    Route::middleware('auth:sanctum')->group(static function (): void {
        Route::post('/downloads/regenerate', [DigitalDownloadController::class, 'regenerate'])
            ->middleware('throttle:download-link-generate')
            ->name('downloads.regenerate');

        Route::post('/team-licenses/{teamLicenseId}/seats', [TeamLicenseController::class, 'allocateSeat'])
            ->whereUuid('teamLicenseId')
            ->middleware('throttle:checkout-create')
            ->name('team-licenses.seats.allocate');
    });
});
