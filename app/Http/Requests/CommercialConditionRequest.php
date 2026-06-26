<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CommercialConditionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canManageTeam() ?? false;
    }

    public function rules(): array
    {
        $tenantId = $this->user()?->tenant_id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'scope_type' => ['required', Rule::in(['global', 'customer', 'region', 'establishment_type'])],
            'customer_id' => ['nullable', Rule::requiredIf($this->input('scope_type') === 'customer'), Rule::exists('customers', 'id')->where('tenant_id', $tenantId)],
            'region_id' => ['nullable', Rule::requiredIf($this->input('scope_type') === 'region'), Rule::exists('regions', 'id')->where('tenant_id', $tenantId)],
            'establishment_type' => ['nullable', Rule::requiredIf($this->input('scope_type') === 'establishment_type'), 'string', 'max:50'],
            'price_adjustment_percentage' => ['required', 'numeric', 'between:-100,999'],
            'max_discount_percentage' => ['required', 'numeric', 'between:0,100'],
            'minimum_order_amount' => ['required', 'numeric', 'min:0'],
            'payment_terms' => ['nullable', 'string', 'max:120'],
            'commission_percentage' => ['required', 'numeric', 'between:0,100'],
            'status' => ['nullable', 'boolean'],
        ];
    }
}
