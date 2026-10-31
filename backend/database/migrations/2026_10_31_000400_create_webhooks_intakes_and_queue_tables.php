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
        Schema::create('webhook_events', static function (Blueprint $table): void {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('provider', 32); // stripe | gumroad
            $table->string('idempotency_key', 191);
            $table->string('event_type', 120);
            $table->char('payload_hash', 64);
            $table->jsonb('payload');
            $table->string('status', 24)->default('processing'); // processing | processed | ignored | failed
            $table->timestampTz('processed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestampsTz();

            $table->unique(['provider', 'idempotency_key'], 'uq_webhook_provider_idempotency');
            $table->index(['status', 'created_at'], 'idx_webhook_events_status_created');
        });

        Schema::create('service_intakes', static function (Blueprint $table): void {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('order_id')->constrained('orders')->restrictOnDelete();
            $table->foreignUuid('order_line_item_id')->unique()->constrained('order_line_items')->restrictOnDelete();
            $table->uuid('client_user_id')->nullable()->index('idx_service_intakes_client_user');

            $table->string('organization_name', 180)->nullable();
            $table->string('contact_email', 254);
            $table->string('service_category', 64); // ai_agents_tooling | workflow_automation | content_creation | creative_production
            $table->string('workspace_slug', 120)->unique();
            $table->string('status', 32)->default('initialized'); // initialized | onboarding_sent | discovery_scheduled | active
            $table->jsonb('intake_context')->default('{}');
            $table->timestampTz('onboarding_sent_at')->nullable();
            $table->timestampsTz();
        });

        // Database queue fallback & Dead-Letter Queue (DLQ) tables
        Schema::create('jobs', static function (Blueprint $table): void {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });

        Schema::create('failed_jobs', static function (Blueprint $table): void {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestampTz('failed_at')->useCurrent();

            $table->index(['queue', 'failed_at'], 'idx_failed_jobs_queue_time');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('service_intakes');
        Schema::dropIfExists('webhook_events');
    }
};
