<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        $productId = $this->input('reference');
        
        return [
            'name'  => 'required',
            'reference'   => ($this->getMethod() == 'POST') ? ['required', Rule::unique('products', 'reference')->ignore($productId, 'reference')] : 'required|unique:products,reference,' . $this->product->id,
            'barcode' => ['nullable', 'string', 'max:80'],
            'description' => 'required',
            'species' => ['nullable', 'string', 'max:30'],
            'category' => ['nullable', 'string', 'max:60'],
            'brand' => ['nullable', 'string', 'max:80'],
            'line' => ['nullable', 'string', 'max:80'],
            'package_size' => ['nullable', 'string', 'max:50'],
            'unity' => 'required',
            'measure' => 'required',
            'price' => 'required',
            'quantity' => ($this->getMethod() == 'POST') ? 'required' : 'nullable',
            'min_quantity' => ($this->getMethod() == 'POST') ? 'required' : 'nullable',
        ];
    }
    
    public function attributes(): array
    {
        return [
            'name' => 'nome da empresa',
            'reference' => 'referência',
            'barcode' => 'código de barras',
            'description' => 'descrição',
            'species' => 'espécie',
            'category' => 'categoria',
            'brand' => 'marca',
            'line' => 'linha',
            'package_size' => 'embalagem',
            'unity' => 'unidade de medida',
            'measure' => 'medida',
            'price' => 'preço',
            'quantity' => 'quantidade',
            'min_quantity' => 'quantidade mínima',
        ];
    }
}
