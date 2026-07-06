<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CampaignRequest extends FormRequest
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
            'scope_type' => ['required', Rule::in(['product', 'brand', 'category', 'region'])],
            'product_ids' => ['nullable', Rule::requiredIf($this->input('scope_type') === 'product'), 'array', 'min:1'],
            'product_ids.*' => [Rule::exists('products', 'id')->where('tenant_id', $tenantId)],
            'region_id' => ['nullable', Rule::requiredIf($this->input('scope_type') === 'region'), Rule::exists('regions', 'id')->where('tenant_id', $tenantId)],
            'brand' => ['nullable', Rule::requiredIf($this->input('scope_type') === 'brand'), 'string', 'max:80'],
            'category' => ['nullable', Rule::requiredIf($this->input('scope_type') === 'category'), 'string', 'max:60'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'goal' => ['nullable', 'string', 'max:5000'],
            'status' => ['nullable', 'boolean'],
        ];
    }
}
