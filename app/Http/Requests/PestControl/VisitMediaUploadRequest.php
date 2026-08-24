<?php

namespace App\Http\Requests\PestControl;

use App\Models\PestControl\VisitMedia;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Upload de evidência do app do técnico (Etapa 5 do app-tecnico.md). Só
 * para o endpoint móvel — o upload do painel web (VisitMediaController)
 * continua com sua validação inline, mais simples por não ter fila local
 * nem idempotência para resolver.
 */
class VisitMediaUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'uuid' => ['required', 'uuid'],
            'file' => ['required', 'file', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
            'category' => ['required', Rule::in([
                VisitMedia::CATEGORY_INFESTATION,
                VisitMedia::CATEGORY_PRODUCT,
                VisitMedia::CATEGORY_DEVICE,
                VisitMedia::CATEGORY_DAMAGE,
                VisitMedia::CATEGORY_INACCESSIBLE_POINT,
                VisitMedia::CATEGORY_SITE_CONDITION,
                VisitMedia::CATEGORY_SERVICE_COMPLETED,
            ])],
            'point_id' => ['nullable', 'integer'],
            'caption' => ['nullable', 'string', 'max:255'],
            'taken_at' => ['nullable', 'date'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'content_hash' => ['nullable', 'string', 'max:128'],
        ];
    }
}
