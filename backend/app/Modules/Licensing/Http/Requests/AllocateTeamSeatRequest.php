<?php

declare(strict_types=1);

namespace App\Modules\Licensing\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class AllocateTeamSeatRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'member_email' => strtolower(trim(strip_tags((string) $this->input('member_email', '')))),
            'role' => strtolower(trim((string) $this->input('role', 'member'))),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'member_email' => ['required', 'string', 'email:rfc', 'max:254'],
            'role' => ['required', 'string', Rule::in(['admin', 'member'])],
        ];
    }
}
