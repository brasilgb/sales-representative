<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
        return [
            'name'  => 'required',
            'cnpj'   => ($this->getMethod() == 'POST') ? 'required|cnpj|unique:customers' : 'required|cnpj|unique:customers,cnpj,' . $this->customer->id,
            'email'  => ($this->getMethod() == 'POST') ? 'required|unique:customers' : 'required|unique:customers,email,' . $this->customer->id,
            'phone' => 'required'
        ];
    }
    
    public function attributes(): array
    {
        return [
            'name' => 'nome da empresa',
            'phone' => 'telefone',
            'email' => 'e-mail',
        ];
    }
}
