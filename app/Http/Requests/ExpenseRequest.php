<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', Rule::exists('users', 'id')->where('tenant_id', $this->user()?->tenant_id)],
            'expense_date' => ['required', 'date'],
            'category' => ['required', Rule::in(['mileage', 'food', 'lodging', 'other'])],
            'amount' => ['required', 'numeric', 'min:0', 'max:9999999999.99'],
            'kilometers' => ['nullable', 'required_if:category,mileage', 'numeric', 'min:0', 'max:99999999.99'],
            'origin' => ['nullable', 'required_if:category,mileage', 'string', 'max:255'],
            'destination' => ['nullable', 'required_if:category,mileage', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'receipt' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp,pdf', 'max:5120'],
            'remove_receipt' => ['nullable', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'user_id' => 'vendedor',
            'expense_date' => 'data',
            'category' => 'categoria',
            'amount' => 'valor',
            'kilometers' => 'quilômetros',
            'origin' => 'origem',
            'destination' => 'destino',
            'description' => 'descrição',
            'receipt' => 'comprovante',
        ];
    }
}
