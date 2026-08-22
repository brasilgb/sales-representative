<?php

namespace App\Http\Requests\PestControl;

use App\Models\PestControl\VisitInspection;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VisitInspectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenantId = $this->user()?->tenant_id;

        return [
            'technician_id' => [
                'nullable',
                Rule::exists('users', 'id')->where('tenant_id', $tenantId),
            ],
            'inspected_at' => ['nullable', 'date'],
            'product_id' => [
                'nullable',
                Rule::exists('pest_control_products', 'id')->where('tenant_id', $tenantId),
            ],
            'consumption_type' => ['nullable', 'string', 'max:50'],
            'consumption_code' => ['nullable', Rule::in([
                VisitInspection::CONSUMPTION_NONE,
                VisitInspection::CONSUMPTION_HALF,
                VisitInspection::CONSUMPTION_FULL,
                VisitInspection::CONSUMPTION_SPOILED,
            ])],
            'replaced' => ['nullable', 'boolean'],
            'device_condition' => ['nullable', 'string', 'max:100'],
            'live_count' => ['nullable', 'integer', 'min:0'],
            'dead_count' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:4096'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'not_inspected' => ['nullable', 'boolean'],
            'not_inspected_reason' => ['required_if:not_inspected,true', 'nullable', 'string', 'max:1000'],
            'species' => ['nullable', 'array'],
            'species.*.species_id' => [
                'required_with:species',
                Rule::exists('pest_control_species', 'id')->where('tenant_id', $tenantId),
            ],
            'species.*.live_count' => ['nullable', 'integer', 'min:0'],
            'species.*.dead_count' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function attributes(): array
    {
        return [
            'not_inspected_reason' => 'justificativa (ponto não inspecionado)',
        ];
    }
}
