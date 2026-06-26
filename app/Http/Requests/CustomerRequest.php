<?php

namespace App\Http\Requests;

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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tenantId = $this->user()?->tenant_id;
        $customerId = $this->route('customer')?->id;

        return [
            'region_id' => [
                'required',
                Rule::exists('regions', 'id')->where('tenant_id', $tenantId),
            ],
            'name' => 'required',
            'establishment_type' => ['nullable', 'string', 'max:50'],
            'cnpj' => [
                'required',
                'cnpj',
                Rule::unique('customers', 'cnpj')->ignore($customerId)->where('tenant_id', $tenantId),
            ],
            'email' => [
                'required',
                Rule::unique('customers', 'email')->ignore($customerId)->where('tenant_id', $tenantId),
            ],
            'phone' => 'required',
            'preferred_visit_days' => ['nullable', 'string', 'max:120'],
            'preferred_visit_time' => ['nullable', 'string', 'max:80'],
            'commercial_notes' => ['nullable', 'string'],
        ];
    }
    
    public function attributes(): array
    {
        return [
            'name' => 'nome da empresa',
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
