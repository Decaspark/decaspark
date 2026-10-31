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
        Schema::create('products', static function (Blueprint $table): void {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('slug', 160)->unique();
            $table->string('title', 255);
            $table->string('pillar', 32); // products | services | for-teams
            $table->string('category_slug', 96);
            $table->string('delivery_kind', 32); // digital | physical | service | bundle | team_license
            $table->text('summary')->nullable();
            $table->jsonb('metadata')->default('{}');
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();

            $table->index(['pillar', 'category_slug'], 'idx_products_pillar_category');
        });

        DB::statement("
            ALTER TABLE products
            ADD CONSTRAINT chk_products_pillar
            CHECK (pillar IN ('products', 'services', 'for-teams'))
        ");

        DB::statement("
            ALTER TABLE products
            ADD CONSTRAINT chk_products_delivery_kind
            CHECK (delivery_kind IN ('digital', 'physical', 'service', 'bundle', 'team_license'))
        ");

        DB::statement('CREATE INDEX idx_products_active_catalog ON products (pillar, category_slug) WHERE is_active = true');
        DB::statement('CREATE INDEX idx_products_metadata_gin ON products USING GIN (metadata jsonb_path_ops)');

        Schema::create('product_variants', static function (Blueprint $table): void {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('sku', 32)->unique();
            $table->string('name', 180);
            $table->string('fulfillment_type', 32); // digital_download | physical_ship | service_intake | team_license
            $table->bigInteger('price_cents');
            $table->char('currency', 3)->default('USD');

            // Isolated private object storage coordinates (hidden from public serialization)
            $table->string('storage_disk', 32)->nullable();
            $table->string('storage_object_key', 512)->nullable();
            $table->string('download_filename', 255)->nullable();
            $table->char('checksum_sha256', 64)->nullable();
            $table->bigInteger('file_size_bytes')->nullable();

            // Physical inventory & weight parameters (null stock_quantity = non-depleted digital/service)
            $table->integer('weight_grams')->nullable();
            $table->integer('stock_quantity')->nullable();

            // Team license seat provisioning defaults
            $table->integer('default_seat_count')->nullable();

            $table->jsonb('attributes')->default('{}');
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();

            $table->index(['product_id', 'is_active'], 'idx_variants_product_active');
            $table->index('fulfillment_type', 'idx_variants_fulfillment_type');
        });

        // Strict canonical Decaspark SKU format: e.g. DS-DIG-NOTION-001, DS-BOOK-HC-001, DS-SVC-AUTO-001, DS-TEAM-ENT-050
        DB::statement("
            ALTER TABLE product_variants
            ADD CONSTRAINT chk_product_variants_sku_format
            CHECK (sku ~ '^DS-(DIG|BOOK|GOOD|SVC|TEAM)-[A-Z0-9]{2,8}-[0-9]{3,6}$')
        ");

        DB::statement("
            ALTER TABLE product_variants
            ADD CONSTRAINT chk_product_variants_fulfillment_type
            CHECK (fulfillment_type IN ('digital_download', 'physical_ship', 'service_intake', 'team_license'))
        ");

        DB::statement('
            ALTER TABLE product_variants
            ADD CONSTRAINT chk_product_variants_non_negative_values
            CHECK (
                price_cents >= 0
                AND (stock_quantity IS NULL OR stock_quantity >= 0)
                AND (weight_grams IS NULL OR weight_grams >= 0)
                AND (default_seat_count IS NULL OR default_seat_count > 0)
            )
        ');
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
    }
};
