<?php

declare(strict_types=1);

namespace App\Modules\Fulfillment\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class RegenerateDownloadLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'license_id' => strtolower(trim((string) $this->input('license_id', ''))),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'license_id' => ['required', 'uuid'],
        ];
    }
}
