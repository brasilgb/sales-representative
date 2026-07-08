<?php

namespace App\Http\Requests;

use App\Models\CommercialCondition;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class CommercialConditionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canManageTeam() ?? false;
    }

    public function rules(): array
    {
        $tenantId = $this->user()?->tenant_id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'scope_type' => ['required', Rule::in(['global', 'customer', 'region', 'establishment_type', 'campaign'])],
            'customer_id' => ['nullable', Rule::requiredIf($this->input('scope_type') === 'customer'), Rule::exists('customers', 'id')->where('tenant_id', $tenantId)],
            'region_id' => ['nullable', Rule::requiredIf($this->input('scope_type') === 'region'), Rule::exists('regions', 'id')->where('tenant_id', $tenantId)],
            'campaign_id' => ['nullable', Rule::requiredIf($this->input('scope_type') === 'campaign'), Rule::exists('campaigns', 'id')->where('tenant_id', $tenantId)],
            'establishment_type' => ['nullable', Rule::requiredIf($this->input('scope_type') === 'establishment_type'), 'string', 'max:50'],
            'price_adjustment_percentage' => ['required', 'numeric', 'between:-100,999'],
            'max_discount_percentage' => ['required', 'numeric', 'between:0,100'],
            'minimum_order_amount' => ['required', 'numeric', 'min:0'],
            'payment_terms' => ['nullable', 'string', 'max:120'],
            'commission_percentage' => ['required', 'numeric', 'between:0,100'],
            'status' => ['nullable', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty() || ! $this->boolean('status')) {
                    return;
                }

                $scopeType = $this->string('scope_type')->value();
                $query = CommercialCondition::active()->where('scope_type', $scopeType);

                match ($scopeType) {
                    'customer' => $query->where('customer_id', $this->integer('customer_id')),
                    'region' => $query->where('region_id', $this->integer('region_id')),
                    'campaign' => $query->where('campaign_id', $this->integer('campaign_id')),
                    'establishment_type' => $query->where('establishment_type', $this->string('establishment_type')->value()),
                    default => null,
                };

                $currentCondition = $this->route('commercial_condition');

                if ($currentCondition instanceof CommercialCondition) {
                    $query->whereKeyNot($currentCondition->getKey());
                }

                if ($existingCondition = $query->first()) {
                    $validator->errors()->add(
                        'scope_type',
                        "Já existe a condição ativa \"{$existingCondition->name}\" para esta aplicação. Edite-a ou desative-a antes de ativar outra.",
                    );
                }
            },
        ];
    }
}
