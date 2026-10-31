<?php

declare(strict_types=1);

namespace App\Modules\Fulfillment\Jobs;

use App\Modules\Catalog\Enums\FulfillmentType;
use App\Modules\Checkout\Enums\OrderFulfillmentState;
use App\Modules\Checkout\Models\Order;
use Carbon\CarbonImmutable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Config\Repository as ConfigRepository;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Http\Client\Factory as HttpClient;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use RuntimeException;
use Throwable;

final class DispatchPhysicalShipmentJob implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;

    public int $uniqueFor = 600;

    /**
     * Exponential retry schedule: 15s -> 60s -> 300s before routing to failed_jobs DLQ.
     *
     * @return list<int>
     */
    public function backoff(): array
    {
        return [15, 60, 300];
    }

    public function __construct(
        public readonly string $orderId,
    ) {}

    public function uniqueId(): string
    {
        return "physical-ship:{$this->orderId}";
    }

    public function handle(
        ConnectionInterface $db,
        HttpClient $http,
        ConfigRepository $config,
    ): void {
        /** @var Order|null $order */
        $order = Order::query()
            ->with(['lineItems.variant'])
            ->find($this->orderId);

        if ($order === null) {
            return;
        }

        if ($order->shipping_tracking_number !== null) {
            return;
        }

        $physicalItems = $order->lineItems
            ->filter(static fn ($item): bool => $item->fulfillment_type === FulfillmentType::PhysicalShip)
            ->values();

        if ($physicalItems->isEmpty()) {
            return;
        }

        $baseUrl = rtrim((string) $config->get('decaspark.logistics.base_url', ''), '/');
        $apiKey = (string) $config->get('decaspark.logistics.api_key', '');
        $timeout = (int) $config->get('decaspark.logistics.timeout_seconds', 15);

        if ($baseUrl === '' || $apiKey === '') {
            throw new RuntimeException('Logistics provider credentials are not configured.');
        }

        $payload = [
            'external_order_id' => $order->id,
            'order_number' => $order->order_number,
            'recipient_email' => $order->customer_email,
            'shipping_destination' => $order->shipping_parameters,
            'items' => $physicalItems->map(static fn ($item): array => [
                'sku' => $item->sku_snapshot,
                'title' => $item->title_snapshot,
                'quantity' => $item->quantity,
                'weight_grams' => $item->variant?->weight_grams ?? 0,
            ])->all(),
        ];

        $response = $http
            ->timeout($timeout)
            ->withToken($apiKey)
            ->withHeaders([
                'Idempotency-Key' => "decaspark-ship-{$order->id}",
                'Accept' => 'application/json',
            ])
            ->post("{$baseUrl}/v1/fulfillments", $payload)
            ->throw();

        /** @var array<string, mixed> $body */
        $body = $response->json() ?? [];
        $carrier = (string) ($body['carrier'] ?? 'print_partner');
        $trackingNumber = (string) ($body['tracking_number'] ?? "DSP-{$order->order_number}");
        $now = CarbonImmutable::now('UTC');

        $db->transaction(static function () use ($order, $physicalItems, $carrier, $trackingNumber, $now): void {
            foreach ($physicalItems as $lineItem) {
                $lineItem->update(['fulfillment_state' => 'dispatched']);

                if ($lineItem->variant !== null && $lineItem->variant->stock_quantity !== null) {
                    $lineItem->variant
                        ->newQuery()
                        ->whereKey($lineItem->product_variant_id)
                        ->where('stock_quantity', '>=', $lineItem->quantity)
                        ->decrement('stock_quantity', $lineItem->quantity);
                }
            }

            $allItemsDone = $order->lineItems()
                ->whereIn('fulfillment_state', ['pending', 'failed'])
                ->doesntExist();

            $order->update([
                'shipping_carrier' => $carrier,
                'shipping_tracking_number' => $trackingNumber,
                'shipped_at' => $now,
                'fulfillment_state' => $allItemsDone
                    ? OrderFulfillmentState::Shipped
                    : OrderFulfillmentState::PartiallyFulfilled,
                'fulfilled_at' => $allItemsDone ? $now : null,
            ]);
        });
    }

    public function failed(Throwable $exception): void
    {
        Order::query()
            ->whereKey($this->orderId)
            ->update(['fulfillment_state' => OrderFulfillmentState::Failed->value]);
    }
}
