<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', static function (Blueprint $table): void {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('order_number', 28)->unique();
            $table->uuid('user_id')->nullable()->index('idx_orders_user_id'); // Compatible with Supabase auth.users(id)
            $table->string('customer_email', 254)->index('idx_orders_customer_email');
            $table->string('organization_name', 180)->nullable();

            $table->string('checkout_session_id', 191)->unique();
            $table->string('payment_provider', 32); // stripe | gumroad | manual
            $table->string('payment_intent_id', 191)->nullable()->index('idx_orders_payment_intent');
            $table->string('payment_status', 32)->default('pending'); // pending | paid | refunded | failed
            $table->string('fulfillment_state', 32)->default('pending'); // pending | processing | generated | partially_fulfilled | shipped | completed | failed

            $table->char('currency', 3)->default('USD');
            $table->bigInteger('subtotal_cents');
            $table->bigInteger('tax_cents')->default(0);
            $table->bigInteger('shipping_cents')->default(0);
            $table->bigInteger('discount_cents')->default(0);
            $table->bigInteger('total_cents');

            $table->jsonb('tax_parameters')->default('{}');
            $table->jsonb('shipping_parameters')->default('{}');
            $table->string('shipping_carrier', 64)->nullable();
            $table->string('shipping_tracking_number', 128)->nullable();

            $table->timestampTz('paid_at')->nullable();
            $table->timestampTz('shipped_at')->nullable();
            $table->timestampTz('fulfilled_at')->nullable();
            $table->timestampsTz();

            $table->index(['fulfillment_state', 'created_at'], 'idx_orders_fulfillment_created');
        });

        DB::statement("
            ALTER TABLE orders
            ADD CONSTRAINT chk_orders_payment_status
            CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed'))
        ");

        DB::statement("
            ALTER TABLE orders
            ADD CONSTRAINT chk_orders_fulfillment_state
            CHECK (fulfillment_state IN ('pending', 'processing', 'generated', 'partially_fulfilled', 'shipped', 'completed', 'failed'))
        ");

        DB::statement('
            ALTER TABLE orders
            ADD CONSTRAINT chk_orders_monetary_integrity
            CHECK (
                subtotal_cents >= 0
                AND tax_cents >= 0
                AND shipping_cents >= 0
                AND discount_cents >= 0
                AND total_cents >= 0
                AND total_cents = (subtotal_cents + tax_cents + shipping_cents - discount_cents)
            )
        ');

        Schema::create('order_line_items', static function (Blueprint $table): void {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained('products')->restrictOnDelete();
            $table->foreignUuid('product_variant_id')->constrained('product_variants')->restrictOnDelete();

            $table->string('sku_snapshot', 32);
            $table->string('title_snapshot', 255);
            $table->string('fulfillment_type', 32);

            $table->integer('quantity');
            $table->bigInteger('unit_price_cents');
            $table->bigInteger('tax_cents')->default(0);
            $table->bigInteger('line_total_cents');
            $table->string('fulfillment_state', 32)->default('pending'); // pending | generated | intake_created | dispatched | shipped | failed
            $table->jsonb('metadata')->default('{}');
            $table->timestampsTz();

            $table->index(['order_id', 'fulfillment_type'], 'idx_line_items_order_fulfillment');
        });

        DB::statement('
            ALTER TABLE order_line_items
            ADD CONSTRAINT chk_order_line_items_amounts
            CHECK (quantity > 0 AND unit_price_cents >= 0 AND tax_cents >= 0 AND line_total_cents >= 0)
        ');
    }

    public function down(): void
    {
        Schema::dropIfExists('order_line_items');
        Schema::dropIfExists('orders');
    }
};
