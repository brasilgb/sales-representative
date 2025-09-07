<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
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
            'reference'   => ($this->getMethod() == 'POST') ? 'required|unique:products' : 'required|unique:products,reference,' . $this->product->id,
            'description' => 'required',
            'unity' => 'required',
            'measure' => 'required',
            'price' => 'required',
            'quantity' => 'required',
            'min_quantity' => 'required'
        ];
    }
    
    public function attributes(): array
    {
        return [
            'name' => 'nome da empresa',
            'reference' => 'referência',
            'description' => 'descrição',
            'unity' => 'unidade de medida',
            'measure' => 'medida',
            'price' => 'preço',
            'quantity' => 'quantidade',
            'min_quantity' => 'quantidade mínima',
        ];
    }
}
