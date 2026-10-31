<?php

declare(strict_types=1);

namespace App\Providers;

use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Models\ProductVariant;
use App\Modules\Catalog\Observers\CatalogCacheObserver;
use App\Modules\Infrastructure\Listeners\DeadLetterQueueAlertListener;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Queue\Events\JobFailed;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

final class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Service bindings are autowired via constructor dependency injection
    }

    public function boot(): void
    {
        // Enforce strict Eloquent safety (prevents N+1 lazy loading, silent attribute discarding, and missing attributes)
        Model::shouldBeStrict(! $this->app->isProduction());
        Model::preventSilentlyDiscardingAttributes();

        // Automatic Redis catalog invalidation on product or SKU mutations
        Product::observe(CatalogCacheObserver::class);
        ProductVariant::observe(CatalogCacheObserver::class);

        // Dead-Letter Queue (DLQ) immediate alert monitor when any job exhausts its 3 retries
        Queue::failing(function (JobFailed $event): void {
            $this->app->make(DeadLetterQueueAlertListener::class)->handle($event);
        });

        $this->configureRateLimiting();
    }

    private function configureRateLimiting(): void
    {
        // High-throughput public catalog read limiter (120 req/min per IP)
        RateLimiter::for('catalog-read', static function (Request $request): Limit {
            return Limit::perMinute(120)->by((string) $request->ip());
        });

        // Strict checkout creation limiter to prevent card-testing & inventory exhaustion (10 req/min per user/IP)
        RateLimiter::for('checkout-create', static function (Request $request): array {
            $identifier = (string) ($request->user()?->getAuthIdentifier() ?? $request->ip());

            return [
                Limit::perMinute(10)->by("checkout:min:{$identifier}"),
                Limit::perHour(60)->by("checkout:hr:{$identifier}"),
            ];
        });

        // Dynamic signed download link regeneration limiter (5 req / 10 min per authenticated user)
        RateLimiter::for('download-link-generate', static function (Request $request): Limit {
            $identifier = (string) ($request->user()?->getAuthIdentifier() ?? $request->ip());

            return Limit::perMinutes(10, 5)->by("dl-gen:{$identifier}");
        });

        // Isolated file stream bandwidth/abuse limiter (6 stream starts/min per IP + token bucket)
        RateLimiter::for('download-stream', static function (Request $request): array {
            $ip = (string) $request->ip();
            $tokenPrefix = substr((string) $request->route('token', 'anon'), 0, 16);

            return [
                Limit::perMinute(6)->by("dl-stream:ip:{$ip}"),
                Limit::perMinute(3)->by("dl-stream:tok:{$tokenPrefix}"),
            ];
        });

        // Payment webhook ingress burst guard (300 req/min per source IP)
        RateLimiter::for('payment-webhooks', static function (Request $request): Limit {
            return Limit::perMinute(300)->by('webhook:' . (string) $request->ip());
        });
    }
}
