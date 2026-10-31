<?php

declare(strict_types=1);

namespace App\Modules\Licensing\Http\Controllers;

use App\Modules\Licensing\Http\Requests\AllocateTeamSeatRequest;
use App\Modules\Licensing\Services\TeamLicenseService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

final readonly class TeamLicenseController
{
    public function __construct(
        private TeamLicenseService $teamLicenses,
    ) {}

    public function allocateSeat(AllocateTeamSeatRequest $request, string $teamLicenseId): JsonResponse
    {
        $actorUserId = (string) $request->user()?->getAuthIdentifier();

        try {
            $seat = $this->teamLicenses->allocateSeat(
                teamLicenseId: $teamLicenseId,
                actorUserId: $actorUserId,
                memberEmail: (string) $request->validated('member_email'),
                role: (string) $request->validated('role'),
            );

            return new JsonResponse([
                'seat_id' => $seat->id,
                'member_email' => $seat->member_email,
                'role' => $seat->role,
                'status' => $seat->status,
            ], 201);
        } catch (RuntimeException $exception) {
            return new JsonResponse(['error' => $exception->getMessage()], 422);
        }
    }
}
