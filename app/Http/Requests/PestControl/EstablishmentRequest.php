<?php

namespace App\Http\Requests\PestControl;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EstablishmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenantId = $this->user()?->tenant_id;
        $establishmentId = $this->route('establishment')?->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'document' => ['nullable', 'cpf_ou_cnpj'],
            'responsible_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'zip_code' => ['nullable', 'string', 'max:20'],
            'state' => ['nullable', 'string', 'max:20'],
            'city' => ['nullable', 'string', 'max:50'],
            'district' => ['nullable', 'string', 'max:50'],
            'street' => ['nullable', 'string', 'max:80'],
            'number' => ['nullable', 'string', 'max:20'],
            'complement' => ['nullable', 'string', 'max:80'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'checkin_radius_meters' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'internal_code' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('pest_control_establishments', 'internal_code')
                    ->ignore($establishmentId)
                    ->where('tenant_id', $tenantId),
            ],
            'notes' => ['nullable', 'string'],
            'active' => ['nullable', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('document')) {
            $this->merge(['document' => preg_replace('/\D/', '', (string) $this->input('document'))]);
        }
    }

    public function attributes(): array
    {
        return [
            'name' => 'razão social/nome',
            'document' => 'CPF/CNPJ',
            'responsible_name' => 'responsável',
            'checkin_radius_meters' => 'raio permitido para check-in',
            'internal_code' => 'código interno',
        ];
    }
}
