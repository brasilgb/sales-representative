<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PeriodRequest extends FormRequest
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
            'plan_id' => 'required',
            'name' => 'required',
            'interval' => 'required',
            'interval_count' => 'required',
            'price' => 'required'
        ];
    }

    public function attributes(): array
    {
        return [
            'plan_id' => 'plano',
            'name' => 'nome',
            'interval' => 'intervalo',
            'interval_count' => 'quantidade intervalo',
            'price' => 'preço'
        ];
    }
}
