<?php

namespace App\Http\Requests\PestControl;

use Illuminate\Foundation\Http\FormRequest;

class VisitCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'device_time' => ['nullable', 'date'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'accuracy_meters' => ['nullable', 'numeric', 'min:0'],
            'summary' => ['nullable', 'string'],
        ];
    }
}
