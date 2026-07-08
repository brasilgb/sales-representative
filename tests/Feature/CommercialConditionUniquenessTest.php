<?php

use App\Models\Admin\Plan;
use App\Models\CommercialCondition;
use App\Models\Tenant;
use App\Models\User;

function commercialConditionPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Condição padrão',
        'scope_type' => 'global',
        'customer_id' => null,
        'region_id' => null,
        'establishment_type' => null,
        'price_adjustment_percentage' => 0,
        'max_discount_percentage' => 10,
        'minimum_order_amount' => 100,
        'minimum_order_quantity' => 0,
        'payment_terms' => '28 dias',
        'commission_percentage' => 5,
        'status' => true,
    ], $overrides);
}

function commercialConditionOwner(): User
{
    $plan = Plan::create([
        'name' => 'Plano condições comerciais',
        'slug' => 'plano-condicoes-comerciais',
        'account_type' => Tenant::PLAN_TEAM,
        'description' => 'Plano usado nos testes de condições comerciais',
        'features' => ['commercial_conditions'],
        'is_public' => false,
    ]);

    $tenant = Tenant::create([
        'plan' => $plan->id,
        'plan_type' => Tenant::PLAN_TEAM,
        'company' => 'Empresa condições comerciais',
        'cnpj' => '99123456000100',
        'email' => 'condicoes@example.com',
        'status' => true,
        'payment' => true,
        'expiration_date' => now()->addYear(),
    ]);

    return User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => 'Gestor comercial',
        'email' => 'gestor-condicoes@example.com',
        'password' => 'password',
        'roles' => User::ROLE_OWNER,
        'status' => true,
    ]);
}

test('only one commercial condition can be active for the same application', function () {
    $owner = commercialConditionOwner();
    $this->actingAs($owner);

    $existing = CommercialCondition::create(commercialConditionPayload(['name' => 'Condição existente']));

    $this->post(route('app.commercial-conditions.store'), commercialConditionPayload(['name' => 'Condição duplicada']))
        ->assertSessionHasErrors([
            'scope_type' => 'Já existe a condição ativa "Condição existente" para esta aplicação. Edite-a ou desative-a antes de ativar outra.',
        ]);

    expect(CommercialCondition::active()->count())->toBe(1);

    $existing->update(['status' => false]);

    $this->post(route('app.commercial-conditions.store'), commercialConditionPayload(['name' => 'Nova condição']))
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('app.commercial-conditions.index'));

    $this->patch(
        route('app.commercial-conditions.update', $existing),
        commercialConditionPayload(['name' => 'Condição existente', 'status' => true]),
    )->assertSessionHasErrors('scope_type');

    expect(CommercialCondition::active()->count())->toBe(1);
});
