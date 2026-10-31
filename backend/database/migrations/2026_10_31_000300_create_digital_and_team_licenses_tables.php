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
        Schema::create('team_licenses', static function (Blueprint $table): void {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('order_id')->constrained('orders')->restrictOnDelete();
            $table->foreignUuid('order_line_item_id')->unique()->constrained('order_line_items')->restrictOnDelete();
            $table->uuid('owner_user_id')->index('idx_team_licenses_owner');
            $table->foreignUuid('product_id')->constrained('products')->restrictOnDelete();

            $table->string('organization_name', 180);
            $table->char('license_key_hash', 64)->unique();
            $table->string('license_key_prefix', 16);
            $table->integer('seat_limit');
            $table->integer('seats_allocated')->default(0);
            $table->string('status', 32)->default('active'); // active | suspended | expired | revoked
            $table->timestampTz('expires_at')->nullable();
            $table->jsonb('metadata')->default('{}');
            $table->timestampsTz();
        });

        DB::statement('
            ALTER TABLE team_licenses
            ADD CONSTRAINT chk_team_licenses_seat_bounds
            CHECK (seat_limit > 0 AND seats_allocated >= 0 AND seats_allocated <= seat_limit)
        ');

        DB::statement("
            ALTER TABLE team_licenses
            ADD CONSTRAINT chk_team_licenses_status
            CHECK (status IN ('active', 'suspended', 'expired', 'revoked'))
        ");

        Schema::create('team_license_seats', static function (Blueprint $table): void {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('team_license_id')->constrained('team_licenses')->cascadeOnDelete();
            $table->uuid('member_user_id')->nullable()->index('idx_team_seats_member_user');
            $table->string('member_email', 254);
            $table->string('role', 24)->default('member'); // owner | admin | member
            $table->string('status', 24)->default('invited'); // invited | active | revoked
            $table->timestampTz('invited_at');
            $table->timestampTz('activated_at')->nullable();
            $table->timestampTz('revoked_at')->nullable();
            $table->timestampsTz();

            $table->index(['team_license_id', 'status'], 'idx_team_seats_license_status');
        });

        DB::statement("
            CREATE UNIQUE INDEX uq_team_license_active_email
            ON team_license_seats (team_license_id, lower(member_email))
            WHERE status <> 'revoked'
        ");

        Schema::create('digital_licenses', static function (Blueprint $table): void {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignUuid('order_line_item_id')->unique()->constrained('order_line_items')->cascadeOnDelete();
            $table->uuid('user_id')->nullable()->index('idx_digital_licenses_user');
            $table->foreignUuid('product_id')->constrained('products')->restrictOnDelete();
            $table->foreignUuid('product_variant_id')->constrained('product_variants')->restrictOnDelete();
            $table->foreignUuid('team_license_id')->nullable()->constrained('team_licenses')->nullOnDelete();

            // Stores SHA-256 digest of the cryptographically random download_token (never raw bearer secrets)
            $table->char('download_token_hash', 64)->unique();
            $table->integer('download_count')->default(0);
            $table->integer('max_downloads')->default(3);
            $table->timestampTz('expiration_timestamp');
            $table->timestampTz('revoked_at')->nullable();
            $table->timestampTz('last_downloaded_at')->nullable();
            $table->ipAddress('last_downloaded_ip')->nullable();
            $table->timestampsTz();

            $table->index(['user_id', 'product_id', 'expiration_timestamp'], 'idx_digital_licenses_user_product_exp');
        });

        DB::statement('
            ALTER TABLE digital_licenses
            ADD CONSTRAINT chk_digital_licenses_download_limits
            CHECK (download_count >= 0 AND max_downloads > 0 AND download_count <= max_downloads)
        ');

        DB::statement('
            CREATE INDEX idx_digital_licenses_active_token
            ON digital_licenses (download_token_hash, expiration_timestamp)
            WHERE revoked_at IS NULL
        ');

        Schema::create('digital_download_audit_logs', static function (Blueprint $table): void {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('digital_license_id')->constrained('digital_licenses')->cascadeOnDelete();
            $table->ipAddress('ip_address');
            $table->string('user_agent', 512)->nullable();
            $table->bigInteger('bytes_streamed')->default(0);
            $table->timestampTz('downloaded_at');

            $table->index(['digital_license_id', 'downloaded_at'], 'idx_download_audit_license_time');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('digital_download_audit_logs');
        Schema::dropIfExists('digital_licenses');
        Schema::dropIfExists('team_license_seats');
        Schema::dropIfExists('team_licenses');
    }
};
