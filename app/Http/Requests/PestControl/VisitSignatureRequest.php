<?php

namespace App\Http\Requests\PestControl;

use Illuminate\Foundation\Http\FormRequest;

class VisitSignatureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'responsible_name' => ['required', 'string', 'max:255'],
            'responsible_role' => ['nullable', 'string', 'max:100'],
            'responsible_document' => ['nullable', 'string', 'max:30'],
            // Assinatura capturada em canvas no frontend (data URI base64).
            'signature' => ['required', 'string', 'starts_with:data:image/', 'max:1000000'],
            'compliance_text' => ['nullable', 'string'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ];
    }

    public function attributes(): array
    {
        return [
            'responsible_name' => 'nome do responsável',
            'responsible_role' => 'função/cargo',
            'responsible_document' => 'documento',
            'signature' => 'assinatura',
        ];
    }
}
