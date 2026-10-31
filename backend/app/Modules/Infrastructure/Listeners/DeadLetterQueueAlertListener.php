<?php

declare(strict_types=1);

namespace App\Modules\Infrastructure\Listeners;

use Illuminate\Contracts\Config\Repository as ConfigRepository;
use Illuminate\Http\Client\Factory as HttpClient;
use Illuminate\Queue\Events\JobFailed;
use Psr\Log\LoggerInterface;
use Throwable;

final readonly class DeadLetterQueueAlertListener
{
    public function __construct(
        private LoggerInterface $logger,
        private HttpClient $http,
        private ConfigRepository $config,
    ) {}

    public function handle(JobFailed $event): void
    {
        $context = [
            'connection' => $event->connectionName,
            'queue' => $event->job->getQueue(),
            'job_name' => $event->job->resolveName(),
            'job_id' => $event->job->getJobId(),
            'attempts' => $event->job->attempts(),
            'exception_class' => $event->exception::class,
            'exception_message' => $event->exception->getMessage(),
        ];

        // Immediate structured critical log for log-shipping / SIEM / Datadog / Sentry monitors
        $this->logger->critical('decaspark.dlq.job_exhausted_retries', $context);

        $alertWebhookUrl = trim((string) $this->config->get('decaspark.alerts.ops_webhook_url', ''));
        if ($alertWebhookUrl === '') {
            return;
        }

        try {
            $this->http
                ->timeout(5)
                ->post($alertWebhookUrl, [
                    'severity' => 'critical',
                    'service' => 'decaspark-commerce-backend',
                    'event' => 'dead_letter_queue_entry',
                    'details' => $context,
                ]);
        } catch (Throwable $alertError) {
            $this->logger->error('decaspark.dlq.alert_dispatch_failed', [
                'reason' => $alertError->getMessage(),
            ]);
        }
    }
}
