<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PlanRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'account_type' => ['required', Rule::in(['individual', 'team'])],
            'description' => ['required', 'string', 'max:500'],
            'monthly_price' => ['required', 'numeric', 'min:0'],
            'quarterly_price' => ['required', 'numeric', 'min:0'],
            'semiannual_price' => ['required', 'numeric', 'min:0'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nome',
            'description' => 'descrição',
            'account_type' => 'tipo de conta',
            'monthly_price' => 'valor mensal',
            'quarterly_price' => 'valor trimestral',
            'semiannual_price' => 'valor semestral',
        ];
    }
}
