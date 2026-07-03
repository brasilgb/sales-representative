<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $tenantId = $this->user()?->tenant_id;
        $productId = $this->route('product')?->id;

        return [
            'name' => ['required', 'string', 'max:50'],
            'reference' => [
                'required',
                'string',
                'max:50',
                Rule::unique('products', 'reference')->ignore($productId)->where('tenant_id', $tenantId),
            ],
            'barcode' => ['nullable', 'string', 'max:80'],
            'description' => ['required', 'string', 'max:50'],
            'species' => ['nullable', 'string', 'max:30'],
            'category' => ['nullable', 'string', 'max:60'],
            'brand' => ['nullable', 'string', 'max:80'],
            'line' => ['nullable', 'string', 'max:80'],
            'package_size' => ['nullable', 'string', 'max:50'],
            'unity' => ['required', 'string', 'max:20'],
            'measure' => ['required', 'integer', 'min:0'],
            'price' => ['required', 'numeric', 'min:0'],
            'quantity' => $this->isMethod('post') ? ['required', 'integer', 'min:0'] : ['nullable', 'integer', 'min:0'],
            'min_quantity' => $this->isMethod('post') ? ['required', 'integer', 'min:0'] : ['nullable', 'integer', 'min:0'],
            'enabled' => ['required', 'boolean'],
            'observations' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
            'remove_image' => ['nullable', 'boolean'],
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
            'image' => 'imagem',
        ];
    }
}
