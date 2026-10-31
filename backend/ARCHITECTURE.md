# Decaspark Commerce & Fulfillment Backend Architecture (Laravel 11+)

Modular PHP 8.3+ / Laravel 11+ backend engineered for **Decaspark** (`https://decaspark.vercel.app/`) to power simultaneous digital asset delivery, physical book & studio-good logistics, automated AI/workflow service intakes, and multi-seat enterprise team licensing.

---

## 1. Domain-Modular Directory Layout

```text
backend/
├── app/
│   ├── Modules/
│   │   ├── Catalog/
│   │   │   ├── Enums/FulfillmentType.php
│   │   │   ├── Http/Controllers/CatalogController.php
│   │   │   ├── Models/{Product.php,ProductVariant.php}
│   │   │   ├── Observers/CatalogCacheObserver.php
│   │   │   └── Services/CachedCatalogService.php
│   │   ├── Checkout/
│   │   │   ├── Enums/OrderFulfillmentState.php
│   │   │   ├── Http/
│   │   │   │   ├── Controllers/{CheckoutController.php,PaymentWebhookController.php}
│   │   │   │   └── Requests/CreateCheckoutSessionRequest.php
│   │   │   ├── Jobs/ProcessVerifiedOrderPaymentJob.php
│   │   │   ├── Models/{Order.php,OrderLineItem.php,WebhookEvent.php}
│   │   │   ├── Security/WebhookSignatureVerifier.php
│   │   │   └── Services/WebhookIdempotencyService.php
│   │   ├── Fulfillment/
│   │   │   ├── Data/IssuedDownloadLink.php
│   │   │   ├── Exceptions/DownloadAccessDeniedException.php
│   │   │   ├── Http/
│   │   │   │   ├── Controllers/DigitalDownloadController.php
│   │   │   │   └── Requests/RegenerateDownloadLinkRequest.php
│   │   │   ├── Jobs/{DispatchPhysicalShipmentJob.php,InitializeServiceIntakeJob.php}
│   │   │   ├── Models/{DigitalLicense.php,ServiceIntake.php}
│   │   │   ├── Notifications/{OrderFulfillmentReadyNotification.php,ServiceIntakeInitializedNotification.php}
│   │   │   └── Services/DigitalFulfillmentService.php
│   │   ├── Infrastructure/
│   │   │   └── Listeners/DeadLetterQueueAlertListener.php
│   │   └── Licensing/
│   │       ├── Http/
│   │       │   ├── Controllers/TeamLicenseController.php
│   │       │   └── Requests/AllocateTeamSeatRequest.php
│   │       ├── Models/{TeamLicense.php,TeamLicenseSeat.php}
│   │       └── Services/TeamLicenseService.php
│   └── Providers/AppServiceProvider.php
├── bootstrap/app.php
├── config/{decaspark.php,filesystems.php}
├── database/migrations/
│   ├── 2026_10_31_000100_create_products_and_variants_tables.php
│   ├── 2026_10_31_000200_create_orders_and_line_items_tables.php
│   ├── 2026_10_31_000300_create_digital_and_team_licenses_tables.php
│   └── 2026_10_31_000400_create_webhooks_intakes_and_queue_tables.php
├── routes/api.php
├── .env.example
└── composer.json
```

---

## 2. Queue Topology & Worker Commands

Three isolated Redis queues prevent slow third-party print/logistics calls from starving instant digital fulfillment:

| Queue | Worker Responsibility | Retries (`$tries`) | Exponential Backoff |
| --- | --- | --- | --- |
| `payments` | `ProcessVerifiedOrderPaymentJob` — marks order `paid`, mints signed download tokens & team licenses, fans out downstream jobs `afterCommit()` | `3` | `[5s, 30s, 120s]` |
| `intakes` | `InitializeServiceIntakeJob` — provisions `service_intakes` client workspace & sends onboarding email | `3` | `[10s, 45s, 180s]` |
| `logistics` | `DispatchPhysicalShipmentJob` — dispatches physical book/journal payloads to print/3PL partner with `Idempotency-Key` | `3` | `[15s, 60s, 300s]` |

Recommended Supervisor / Horizon worker invocation:

```bash
php artisan queue:work redis --queue=payments,intakes,logistics --tries=3 --max-time=3600 --memory=256
```

Exhausted jobs land in PostgreSQL `failed_jobs` and immediately fire `DeadLetterQueueAlertListener` (`Queue::failing(...)`) for structured SIEM logging and ops webhook alerting.
