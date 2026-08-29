<?php

namespace App\Http\Requests\PestControl;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class OperatorUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->route('user')),
            ],
            'telephone' => ['nullable', 'string', 'max:20'],
            'whatsapp' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'boolean'],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'password_confirmation' => ['nullable', 'required_with:password'],
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nome',
            'email' => 'e-mail',
            'telephone' => 'telefone',
            'whatsapp' => 'WhatsApp',
            'status' => 'status',
            'password' => 'senha',
            'password_confirmation' => 'confirmação da senha',
        ];
    }
}
