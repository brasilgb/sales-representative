<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VisitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'exists:customers,id'],
            'user_id' => ['nullable', 'exists:users,id'],
            'scheduled_at' => ['required', 'date'],
            'status' => ['nullable', Rule::in(['scheduled', 'checked_in', 'completed', 'canceled'])],
            'result' => ['nullable', Rule::in(['sold', 'no_sale', 'follow_up'])],
            'no_sale_reason' => ['nullable', Rule::in(['sem_estoque', 'preco', 'cliente_fechado', 'sem_decisor', 'retorno_futuro', 'outro'])],
            'next_visit_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }

    public function attributes(): array
    {
        return [
            'customer_id' => 'cliente',
            'user_id' => 'vendedor',
            'scheduled_at' => 'data da visita',
            'status' => 'status',
            'result' => 'resultado',
            'no_sale_reason' => 'motivo sem venda',
            'next_visit_at' => 'próxima visita',
            'notes' => 'observações',
        ];
    }
}
