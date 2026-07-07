<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TenantRequest extends FormRequest
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
        return [
            'company' => 'required',
            'cnpj' => ($this->getMethod() == 'POST') ? 'required|cpf_ou_cnpj|unique:tenants' : 'required|cpf_ou_cnpj|unique:tenants,cnpj,'.$this->tenant->id,
            'email' => 'required',
            'phone' => 'required',
            'plan' => ['required', Rule::exists('plans', 'id')->where(fn ($query) => $query->where('is_public', true))],
            'billing_period_id' => [
                'required',
                Rule::exists('periods', 'id')->where(fn ($query) => $query->where('plan_id', $this->input('plan'))),
            ],
            'status' => ['required', Rule::in([1, 2, 5])],
        ];
    }

    public function attributes(): array
    {
        return [
            'company' => 'nome da empresa',
            'cnpj' => 'CNPJ',
            'email' => 'e-mail',
            'phone' => 'e-mail',
            'status' => 'status',
            'plan' => 'plano',
            'billing_period_id' => 'periodo de cobranca',
        ];
    }
}
