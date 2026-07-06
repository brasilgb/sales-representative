<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CustomerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tenantId = $this->user()?->tenant_id;
        $customerId = $this->route('customer')?->id;
        $regionRule = Rule::exists('regions', 'id')->where(function ($query) use ($tenantId) {
            $query->where('tenant_id', $tenantId);

            if (! $this->user()?->canManageTeam()) {
                $query->whereIn('id', $this->user()->regions()->pluck('regions.id'));
            }
        });

        return [
            'region_id' => [
                'nullable',
                $regionRule,
            ],
            'name' => ['required', 'string', 'max:255'],
            'establishment_type' => ['nullable', 'string', 'max:50'],
            'cnpj' => [
                'nullable',
                'cpf_ou_cnpj',
                Rule::unique('customers', 'cnpj')->ignore($customerId)->where('tenant_id', $tenantId),
            ],
            'email' => [
                'nullable',
                'email',
                Rule::unique('customers', 'email')->ignore($customerId)->where('tenant_id', $tenantId),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'zip_code' => ['nullable', 'string', 'max:20'],
            'state' => ['nullable', 'string', 'max:20'],
            'city' => ['nullable', 'string', 'max:50'],
            'district' => ['nullable', 'string', 'max:50'],
            'street' => ['nullable', 'string', 'max:80'],
            'complement' => ['nullable', 'string', 'max:80'],
            'number' => ['nullable', 'string', 'max:20'],
            'contactname' => ['nullable', 'string', 'max:50'],
            'whatsapp' => ['nullable', 'string', 'max:50'],
            'contactphone' => ['nullable', 'string', 'max:50'],
            'observations' => ['nullable', 'string'],
            'preferred_visit_days' => ['nullable', 'string', 'max:120'],
            'preferred_visit_time' => ['nullable', 'string', 'max:80'],
            'commercial_notes' => ['nullable', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'cnpj' => preg_replace('/\D/', '', (string) $this->input('cnpj')),
        ]);
    }

    public function attributes(): array
    {
        return [
            'name' => 'nome da empresa',
            'cnpj' => 'CPF/CNPJ',
            'region_id' => 'região',
            'establishment_type' => 'tipo de estabelecimento',
            'phone' => 'telefone',
            'email' => 'e-mail',
            'preferred_visit_days' => 'dias preferenciais de visita',
            'preferred_visit_time' => 'horário preferencial de visita',
            'commercial_notes' => 'observações comerciais',
        ];
    }
}
