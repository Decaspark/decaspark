<?php

declare(strict_types=1);

namespace App\Modules\Checkout\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class CreateCheckoutSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $rawItems = is_array($this->input('items')) ? $this->input('items') : [];
        $sanitizedItems = [];

        foreach ($rawItems as $item) {
            if (! is_array($item)) {
                continue;
            }

            $sanitizedItems[] = [
                'sku' => strtoupper(preg_replace('/[^A-Za-z0-9\-]/', '', (string) ($item['sku'] ?? '')) ?? ''),
                'quantity' => (int) ($item['quantity'] ?? 0),
            ];
        }

        $this->merge([
            'customer_email' => strtolower(trim(strip_tags((string) $this->input('customer_email', '')))),
            'organization_name' => $this->filled('organization_name')
                ? trim(strip_tags((string) $this->input('organization_name')))
                : null,
            'items' => $sanitizedItems,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'customer_email' => ['required', 'string', 'email:rfc', 'max:254'],
            'organization_name' => ['nullable', 'string', 'max:180'],
            'items' => ['required', 'array', 'min:1', 'max:25'],
            'items.*.sku' => [
                'required',
                'string',
                'max:32',
                'regex:/^DS-(DIG|BOOK|GOOD|SVC|TEAM)-[A-Z0-9]{2,8}-[0-9]{3,6}$/',
            ],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100'],
            'shipping_address' => ['nullable', 'array'],
            'shipping_address.recipient_name' => ['required_with:shipping_address', 'string', 'max:120'],
            'shipping_address.line1' => ['required_with:shipping_address', 'string', 'max:180'],
            'shipping_address.line2' => ['nullable', 'string', 'max:180'],
            'shipping_address.city' => ['required_with:shipping_address', 'string', 'max:120'],
            'shipping_address.postal_code' => ['required_with:shipping_address', 'string', 'max:32'],
            'shipping_address.country_code' => ['required_with:shipping_address', 'string', 'size:2', 'alpha'],
        ];
    }
}
