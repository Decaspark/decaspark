<?php

declare(strict_types=1);

namespace App\Modules\Catalog\Enums;

enum FulfillmentType: string
{
    case DigitalDownload = 'digital_download';
    case PhysicalShip = 'physical_ship';
    case ServiceIntake = 'service_intake';
    case TeamLicense = 'team_license';
}
