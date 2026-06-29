<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class AppUserRequest extends FormRequest
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
            'name' => 'required',
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'email' => ($this->getMethod() == 'POST') ? 'required|email|unique:users' : 'required|email|unique:users,email,'.$this->user->id,
            'telephone' => ['nullable', 'string', 'max:20'],
            'whatsapp' => ['nullable', 'string', 'max:20'],
            'roles' => 'nullable|in:1,2',
            'status' => 'nullable',
            'regions' => ['nullable', 'array'],
            'regions.*' => [
                'integer',
                Rule::exists('regions', 'id')->where('tenant_id', $this->user()?->tenant_id),
            ],
            'password' => ($this->getMethod() == 'POST') ? ['required', 'min:8', 'confirmed', Rules\Password::defaults()] : ['nullable', 'min:8', 'confirmed', Rules\Password::defaults()],
            'password_confirmation' => ($this->getMethod() == 'POST') ? ['required', 'min:8'] : ['nullable', 'min:8'],
        ];
    }
}
