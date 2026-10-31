<?php

declare(strict_types=1);

return [
    'frontend_url' => env('FRONTEND_URL', 'https://decaspark.vercel.app'),

    'digital_delivery' => [
        'default_disk' => env('DECASPARK_ASSET_DISK', 'r2_private'),
        'token_ttl_hours' => (int) env('DECASPARK_DOWNLOAD_TTL_HOURS', 24),
        'default_max_downloads' => (int) env('DECASPARK_DOWNLOAD_MAX_COUNT', 3),
        'stream_chunk_bytes' => (int) env('DECASPARK_STREAM_CHUNK_BYTES', 65_536),
    ],

    'webhooks' => [
        'stripe' => [
            'signing_secret' => env('STRIPE_WEBHOOK_SECRET', ''),
            'tolerance_seconds' => (int) env('STRIPE_WEBHOOK_TOLERANCE_SECONDS', 300),
        ],
        'gumroad' => [
            'signing_secret' => env('GUMROAD_WEBHOOK_SECRET', ''),
        ],
        'lock_seconds' => 30,
    ],

    'logistics' => [
        'base_url' => env('SHIPPING_PROVIDER_BASE_URL', ''),
        'api_key' => env('SHIPPING_PROVIDER_API_KEY', ''),
        'timeout_seconds' => 15,
    ],

    'catalog_cache' => [
        'store' => env('CACHE_STORE', 'redis'),
        'ttl_seconds' => 3_600,
        'stale_ttl_seconds' => 86_400,
    ],

    'alerts' => [
        'ops_webhook_url' => env('OPS_ALERT_WEBHOOK_URL', ''),
        'ops_email' => env('OPS_ALERT_EMAIL', 'ops@decaspark.com'),
    ],
];
