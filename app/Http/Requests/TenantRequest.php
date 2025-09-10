<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'company_name' => 'required',
            'company_cnpj' => ($this->getMethod() == 'POST') ? 'required|cpf_ou_cnpj|unique:tenants' : 'required|cpf_ou_cnpj|unique:tenants,company_cnpj,' . $this->tenant->id,
            'contact_email' => 'required',
            'contact_name' => 'required',
            'contact_phone' => 'required',
            'plan_id' => 'required',
            'status' => 'required',
        ];
    }

    public function attributes(): array
    {
        return [
            'company_name' => 'nome da empresa',
            'company_cnpj' => 'CNPJ',
            'contact_email' => 'e-mail',
            'contact_name' => 'nome do contato',
            'contact_phone' => 'telefone',
            'status' => 'status',
            'plan_id' => 'plano',
        ];
    }
}
