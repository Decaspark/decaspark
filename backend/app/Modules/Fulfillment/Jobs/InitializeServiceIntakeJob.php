<?php

declare(strict_types=1);

namespace App\Modules\Fulfillment\Jobs;

use App\Modules\Catalog\Enums\FulfillmentType;
use App\Modules\Checkout\Enums\OrderFulfillmentState;
use App\Modules\Checkout\Models\Order;
use App\Modules\Checkout\Models\OrderLineItem;
use App\Modules\Fulfillment\Models\ServiceIntake;
use App\Modules\Fulfillment\Notifications\ServiceIntakeInitializedNotification;
use Carbon\CarbonImmutable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Notifications\AnonymousNotifiable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;
use Throwable;

final class InitializeServiceIntakeJob implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $tries = 3;

    public int $uniqueFor = 600;

    /**
     * Exponential retry schedule: 10s -> 45s -> 180s before routing to failed_jobs DLQ.
     *
     * @return list<int>
     */
    public function backoff(): array
    {
        return [10, 45, 180];
    }

    public function __construct(
        public readonly string $orderId,
        public readonly string $orderLineItemId,
    ) {}

    public function uniqueId(): string
    {
        return "service-intake:{$this->orderLineItemId}";
    }

    public function handle(ConnectionInterface $db): void
    {
        /** @var OrderLineItem|null $lineItem */
        $lineItem = OrderLineItem::query()
            ->with(['order', 'product'])
            ->find($this->orderLineItemId);

        if ($lineItem === null || $lineItem->order === null) {
            return;
        }

        if ($lineItem->fulfillment_type !== FulfillmentType::ServiceIntake) {
            return;
        }

        $order = $lineItem->order;
        $serviceCategory = $lineItem->product?->category_slug ?? 'workflow_automation';

        /** @var ServiceIntake $intake */
        $intake = $db->transaction(static function () use ($order, $lineItem, $serviceCategory): ServiceIntake {
            $existing = ServiceIntake::query()
                ->where('order_line_item_id', $lineItem->id)
                ->lockForUpdate()
                ->first();

            if ($existing !== null) {
                return $existing;
            }

            $orgSlug = Str::slug($order->organization_name ?: Str::before($order->customer_email, '@'));
            $workspaceSlug = "{$orgSlug}-" . strtolower(substr(str_replace('-', '', $lineItem->id), 0, 8));

            $intake = ServiceIntake::query()->create([
                'order_id' => $order->id,
                'order_line_item_id' => $lineItem->id,
                'client_user_id' => $order->user_id,
                'organization_name' => $order->organization_name,
                'contact_email' => strtolower($order->customer_email),
                'service_category' => $serviceCategory,
                'workspace_slug' => $workspaceSlug,
                'status' => 'initialized',
                'intake_context' => [
                    'sku' => $lineItem->sku_snapshot,
                    'service_title' => $lineItem->title_snapshot,
                    'quantity' => $lineItem->quantity,
                    'order_number' => $order->order_number,
                ],
            ]);

            $lineItem->update(['fulfillment_state' => 'intake_created']);

            return $intake;
        });

        // Idempotently fire onboarding email only once
        if ($intake->onboarding_sent_at === null) {
            (new AnonymousNotifiable())
                ->route('mail', $intake->contact_email)
                ->notify(new ServiceIntakeInitializedNotification($intake));

            $now = CarbonImmutable::now('UTC');

            $db->transaction(static function () use ($intake, $order, $now): void {
                $intake->update([
                    'status' => 'onboarding_sent',
                    'onboarding_sent_at' => $now,
                ]);

                $remainingPending = $order->lineItems()
                    ->whereIn('fulfillment_state', ['pending', 'failed'])
                    ->exists();

                if (! $remainingPending) {
                    $order->update([
                        'fulfillment_state' => OrderFulfillmentState::Completed,
                        'fulfilled_at' => $now,
                    ]);
                }
            });
        }
    }

    public function failed(Throwable $exception): void
    {
        OrderLineItem::query()
            ->whereKey($this->orderLineItemId)
            ->update(['fulfillment_state' => 'failed']);
    }
}
