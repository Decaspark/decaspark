<?php

declare(strict_types=1);

namespace App\Modules\Checkout\Enums;

enum OrderFulfillmentState: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case Generated = 'generated';
    case PartiallyFulfilled = 'partially_fulfilled';
    case Shipped = 'shipped';
    case Completed = 'completed';
    case Failed = 'failed';
}
