<?php

declare(strict_types=1);

namespace App\Modules\Checkout\Jobs;

use App\Modules\Catalog\Enums\FulfillmentType;
use App\Modules\Checkout\Enums\OrderFulfillmentState;
use App\Modules\Checkout\Models\Order;
use App\Modules\Checkout\Models\WebhookEvent;
use App\Modules\Checkout\Services\WebhookIdempotencyService;
use App\Modules\Fulfillment\Jobs\DispatchPhysicalShipmentJob;
use App\Modules\Fulfillment\Jobs\InitializeServiceIntakeJob;
use App\Modules\Fulfillment\Notifications\OrderFulfillmentReadyNotification;
use App\Modules\Fulfillment\Services\DigitalFulfillmentService;
use App\Modules\Licensing\Services\TeamLicenseService;
use Carbon\CarbonImmutable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Bus\Dispatcher;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

final class ProcessVerifiedOrderPaymentJob implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;

    public int $uniqueFor = 300;

    /**
     * Exponential retry backoff in seconds.
     *
     * @return list<int>
     */
    public function backoff(): array
    {
        return [5, 30, 120];
    }

    public function __construct(
        public readonly string $webhookEventId,
        public readonly string $checkoutSessionId,
        public readonly ?string $paymentIntentId = null,
    ) {}

    public function uniqueId(): string
    {
        return $this->checkoutSessionId;
    }

    public function handle(
        ConnectionInterface $db,
        DigitalFulfillmentService $digitalFulfillment,
        TeamLicenseService $teamLicenses,
        WebhookIdempotencyService $idempotency,
        Dispatcher $bus,
    ): void {
        $webhookEvent = WebhookEvent::query()->find($this->webhookEventId);
        if ($webhookEvent === null) {
            return;
        }

        if ($webhookEvent->status === 'processed') {
            return;
        }

        $issuedLinks = [];
        $issuedTeamKeys = [];
        $hasPhysicalItems = false;
        $serviceLineItemIds = [];
        $orderModel = null;

        $db->transaction(function () use (
            $digitalFulfillment,
            $teamLicenses,
            &$issuedLinks,
            &$issuedTeamKeys,
            &$hasPhysicalItems,
            &$serviceLineItemIds,
            &$orderModel,
        ): void {
            /** @var Order|null $order */
            $order = Order::query()
                ->with(['lineItems.variant'])
                ->where('checkout_session_id', $this->checkoutSessionId)
                ->lockForUpdate()
                ->first();

            if ($order === null) {
                throw new \RuntimeException("Order not found for checkout_session_id={$this->checkoutSessionId}");
            }

            $orderModel = $order;

            // Idempotency guard: if order was already fulfilled on an earlier attempt, return early
            if (
                $order->payment_status === 'paid'
                && in_array($order->fulfillment_state, [
                    OrderFulfillmentState::Generated,
                    OrderFulfillmentState::Shipped,
                    OrderFulfillmentState::Completed,
                ], true)
            ) {
                return;
            }

            $now = CarbonImmutable::now('UTC');
            $order->update([
                'payment_status' => 'paid',
                'payment_intent_id' => $this->paymentIntentId ?? $order->payment_intent_id,
                'paid_at' => $order->paid_at ?? $now,
                'fulfillment_state' => OrderFulfillmentState::Processing,
            ]);

            foreach ($order->lineItems as $lineItem) {
                match ($lineItem->fulfillment_type) {
                    FulfillmentType::DigitalDownload => $issuedLinks[] = $digitalFulfillment->issueForLineItem($order, $lineItem),
                    FulfillmentType::TeamLicense => $issuedTeamKeys[] = $teamLicenses->provisionFromOrderLineItem($order, $lineItem),
                    FulfillmentType::PhysicalShip => $hasPhysicalItems = true,
                    FulfillmentType::ServiceIntake => $serviceLineItemIds[] = $lineItem->id,
                };
            }

            $nextState = ($hasPhysicalItems || $serviceLineItemIds !== [])
                ? OrderFulfillmentState::PartiallyFulfilled
                : OrderFulfillmentState::Generated;

            $order->update([
                'fulfillment_state' => $nextState,
                'fulfilled_at' => $nextState === OrderFulfillmentState::Generated ? $now : null,
            ]);
        });

        if ($orderModel === null) {
            return;
        }

        // Dispatch heavy async physical & studio service workflows AFTER transaction commit
        if ($hasPhysicalItems) {
            $bus->dispatch(
                (new DispatchPhysicalShipmentJob($orderModel->id))
                    ->onQueue('logistics')
                    ->afterCommit(),
            );
        }

        foreach ($serviceLineItemIds as $lineItemId) {
            $bus->dispatch(
                (new InitializeServiceIntakeJob($orderModel->id, $lineItemId))
                    ->onQueue('intakes')
                    ->afterCommit(),
            );
        }

        if ($issuedLinks !== [] || $issuedTeamKeys !== []) {
            (new AnonymousNotifiable())
                ->route('mail', $orderModel->customer_email)
                ->notify(new OrderFulfillmentReadyNotification($orderModel, $issuedLinks));
        }

        $idempotency->markProcessed($webhookEvent);
    }

    public function failed(Throwable $exception): void
    {
        $webhookEvent = WebhookEvent::query()->find($this->webhookEventId);
        if ($webhookEvent !== null) {
            $webhookEvent->update([
                'status' => 'failed',
                'error_message' => mb_substr($exception->getMessage(), 0, 2_000),
            ]);
        }
    }
}
