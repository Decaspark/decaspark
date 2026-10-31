<?php

declare(strict_types=1);

namespace App\Modules\Checkout\Http\Controllers;

use App\Modules\Catalog\Enums\FulfillmentType;
use App\Modules\Catalog\Models\ProductVariant;
use App\Modules\Checkout\Enums\OrderFulfillmentState;
use App\Modules\Checkout\Http\Requests\CreateCheckoutSessionRequest;
use App\Modules\Checkout\Models\Order;
use Carbon\CarbonImmutable;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

final readonly class CheckoutController
{
    public function __construct(
        private ConnectionInterface $db,
    ) {}

    public function store(CreateCheckoutSessionRequest $request): JsonResponse
    {
        /** @var list<array{sku: string, quantity: int}> $requestedItems */
        $requestedItems = $request->validated('items');
        $skus = array_values(array_unique(array_column($requestedItems, 'sku')));

        $variantsBySku = ProductVariant::query()
            ->with('product')
            ->whereIn('sku', $skus)
            ->where('is_active', true)
            ->get()
            ->keyBy('sku');

        if ($variantsBySku->count() !== count($skus)) {
            return new JsonResponse(['error' => 'One or more requested SKUs are invalid or inactive.'], 422);
        }

        $requiresShippingAddress = false;
        $subtotalCents = 0;
        $preparedLines = [];

        foreach ($requestedItems as $row) {
            /** @var ProductVariant $variant */
            $variant = $variantsBySku->get($row['sku']);
            $quantity = $row['quantity'];

            if ($variant->fulfillment_type === FulfillmentType::PhysicalShip) {
                $requiresShippingAddress = true;
                if ($variant->stock_quantity !== null && $variant->stock_quantity < $quantity) {
                    return new JsonResponse([
                        'error' => "Insufficient inventory for SKU {$variant->sku}.",
                    ], 409);
                }
            }

            $lineTotal = $variant->price_cents * $quantity;
            $subtotalCents += $lineTotal;

            $preparedLines[] = [
                'variant' => $variant,
                'quantity' => $quantity,
                'line_total_cents' => $lineTotal,
            ];
        }

        if ($requiresShippingAddress && ! $request->filled('shipping_address')) {
            return new JsonResponse([
                'error' => 'A shipping_address is required when ordering physical editions or studio goods.',
            ], 422);
        }

        $shippingCents = $requiresShippingAddress ? 1_200 : 0;
        $taxCents = 0;
        $totalCents = $subtotalCents + $shippingCents + $taxCents;

        $checkoutSessionId = 'cs_ds_' . bin2hex(random_bytes(16));
        $orderNumber = 'ORD-' . CarbonImmutable::now('UTC')->format('Ymd') . '-' . strtoupper(Str::random(6));

        /** @var Order $order */
        $order = $this->db->transaction(static function () use (
            $request,
            $orderNumber,
            $checkoutSessionId,
            $subtotalCents,
            $taxCents,
            $shippingCents,
            $totalCents,
            $preparedLines,
        ): Order {
            $order = Order::query()->create([
                'order_number' => $orderNumber,
                'user_id' => $request->user()?->getAuthIdentifier(),
                'customer_email' => (string) $request->validated('customer_email'),
                'organization_name' => $request->validated('organization_name'),
                'checkout_session_id' => $checkoutSessionId,
                'payment_provider' => 'stripe',
                'payment_status' => 'pending',
                'fulfillment_state' => OrderFulfillmentState::Pending,
                'currency' => 'USD',
                'subtotal_cents' => $subtotalCents,
                'tax_cents' => $taxCents,
                'shipping_cents' => $shippingCents,
                'discount_cents' => 0,
                'total_cents' => $totalCents,
                'tax_parameters' => ['calculation_mode' => 'checkout_tax'],
                'shipping_parameters' => $request->validated('shipping_address') ?? [],
            ]);

            foreach ($preparedLines as $line) {
                /** @var ProductVariant $variant */
                $variant = $line['variant'];
                $order->lineItems()->create([
                    'product_id' => $variant->product_id,
                    'product_variant_id' => $variant->id,
                    'sku_snapshot' => $variant->sku,
                    'title_snapshot' => "{$variant->product?->title} — {$variant->name}",
                    'fulfillment_type' => $variant->fulfillment_type,
                    'quantity' => $line['quantity'],
                    'unit_price_cents' => $variant->price_cents,
                    'tax_cents' => 0,
                    'line_total_cents' => $line['line_total_cents'],
                    'fulfillment_state' => 'pending',
                ]);
            }

            return $order;
        });

        return new JsonResponse([
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'checkout_session_id' => $order->checkout_session_id,
            'total_cents' => $order->total_cents,
            'currency' => $order->currency,
        ], 201);
    }
}
