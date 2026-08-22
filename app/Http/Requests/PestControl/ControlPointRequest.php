<?php

namespace App\Http\Requests\PestControl;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ControlPointRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenantId = $this->user()?->tenant_id;
        $pointId = $this->route('point')?->id;

        return [
            'establishment_id' => [
                'required',
                Rule::exists('pest_control_establishments', 'id')->where('tenant_id', $tenantId),
            ],
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('pest_control_control_points', 'code')
                    ->ignore($pointId)
                    ->where('establishment_id', $this->input('establishment_id')),
            ],
            'label' => ['nullable', 'string', 'max:255'],
            'category_key' => ['nullable', 'string', 'max:50'],
            'default_product_id' => [
                'nullable',
                Rule::exists('pest_control_products', 'id')->where('tenant_id', $tenantId),
            ],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'instructions' => ['nullable', 'string'],
            'display_order' => ['nullable', 'integer', 'min:0'],
            'required' => ['nullable', 'boolean'],
            'active' => ['nullable', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'establishment_id' => 'estabelecimento',
            'code' => 'código',
            'category_key' => 'categoria de controle',
            'default_product_id' => 'produto padrão',
            'display_order' => 'ordem de exibição',
        ];
    }
}
