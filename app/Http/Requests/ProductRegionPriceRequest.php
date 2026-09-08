<?php

namespace App\Http\Requests;

use App\Models\ProductRegionPrice;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRegionPriceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canManageTeam() ?? false;
    }

    public function rules(): array
    {
        $tenantId = $this->user()?->tenant_id;
        $product = $this->route('product');
        $current = $this->route('regionPrice');

        return [
            'region_id' => [
                'required',
                Rule::exists('regions', 'id')->where('tenant_id', $tenantId),
                Rule::unique('product_region_prices')
                    ->where('tenant_id', $tenantId)
                    ->where('product_id', $product?->id)
                    ->ignore($current instanceof ProductRegionPrice ? $current->id : null),
            ],
            'special_price' => ['required', 'numeric', 'min:0', 'max:9999999.99'],
            'is_active' => ['nullable', 'boolean'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
        ];
    }
}
