<?php

namespace App\Http\Requests\PestControl;

use Illuminate\Foundation\Http\FormRequest;

class VisitCheckinRequest extends FormRequest
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
            'justification' => ['nullable', 'string', 'max:1000'],
            'device_id' => ['nullable', 'string', 'max:255'],
            'app_version' => ['nullable', 'string', 'max:50'],
            'offline_capture' => ['nullable', 'boolean'],
        ];
    }
}
