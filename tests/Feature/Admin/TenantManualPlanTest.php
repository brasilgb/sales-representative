<?php

use App\Models\Admin\Plan;
use App\Models\Tenant;
use App\Models\User;
use App\Support\PlanLimits;

function rootForManualPlan(): User
{
    return User::withoutGlobalScopes()->create([
        'name' => 'Root Manual Plan',
        'email' => 'root-manual-plan@example.com',
        'password' => 'password',
        'roles' => User::ROLE_ROOT,
        'status' => 1,
        'tenant_id' => null,
    ]);
}

function expiredTrialTenant(): Tenant
{
    return Tenant::create([
        'company' => 'Empresa Teste Expirado',
        'cnpj' => '11222333000181',
        'email' => 'teste-expirado@example.com',
        'phone' => '11999999999',
        'status' => 1,
        'payment' => false,
        'trial_ends_at' => now()->subDays(20),
        'expiration_date' => today()->subDays(20),
    ]);
}

test('assigning a plan manually releases a company stuck on expired trial', function () {
    $root = rootForManualPlan();
    $tenant = expiredTrialTenant();
    $plan = Plan::with('periods')->where('is_public', true)->firstOrFail();
    $period = $plan->periods->firstWhere('interval_count', 1) ?? $plan->periods->first();

    expect(PlanLimits::forTenant($tenant)->subscriptionBlockedReason())->toBe('Período de teste expirado');

    $this->actingAs($root)
        ->patch(route('admin.tenants.update', $tenant), [
            'company' => $tenant->company,
            'cnpj' => $tenant->cnpj,
            'email' => $tenant->email,
            'phone' => $tenant->phone,
            'plan' => $plan->id,
            'billing_period_id' => $period->id,
            'status' => 1,
            'payment' => true,
        ])
        ->assertRedirect(route('admin.tenants.show', $tenant->id));

    $tenant->refresh();

    expect($tenant->payment)->toBeTrue()
        ->and($tenant->trial_ends_at)->toBeNull()
        ->and($tenant->plan)->toBe($plan->id)
        ->and($tenant->plan_type)->toBe($plan->account_type)
        ->and($tenant->expiration_date->isFuture())->toBeTrue()
        ->and($tenant->subscriptionStatus())->not->toBe('Teste expirado')
        ->and(PlanLimits::forTenant($tenant)->subscriptionBlockedReason())->toBeNull();
});

test('admin can set the expiration date manually', function () {
    $root = rootForManualPlan();
    $tenant = expiredTrialTenant();
    $plan = Plan::with('periods')->where('is_public', true)->firstOrFail();
    $period = $plan->periods->first();
    $expiresAt = today()->addMonths(8);

    $this->actingAs($root)
        ->patch(route('admin.tenants.update', $tenant), [
            'company' => $tenant->company,
            'cnpj' => $tenant->cnpj,
            'email' => $tenant->email,
            'phone' => $tenant->phone,
            'plan' => $plan->id,
            'billing_period_id' => $period->id,
            'status' => 1,
            'payment' => true,
            'expiration_date' => $expiresAt->toDateString(),
        ])
        ->assertRedirect();

    expect($tenant->fresh()->expiration_date->toDateString())->toBe($expiresAt->toDateString());
});

test('editing a company on an active trial keeps the trial running', function () {
    $root = rootForManualPlan();
    $plan = Plan::with('periods')->where('is_public', true)->firstOrFail();
    $period = $plan->periods->first();

    $tenant = Tenant::create([
        'company' => 'Empresa Em Teste',
        'cnpj' => '11222333000181',
        'email' => 'em-teste@example.com',
        'phone' => '11988888888',
        'status' => 1,
        'payment' => false,
        'plan' => $plan->id,
        'billing_period_id' => $period->id,
        'trial_ends_at' => now()->addDays(5),
        'expiration_date' => today()->addDays(5),
    ]);

    $this->actingAs($root)
        ->patch(route('admin.tenants.update', $tenant), [
            'company' => 'Empresa Em Teste Renomeada',
            'cnpj' => $tenant->cnpj,
            'email' => $tenant->email,
            'phone' => $tenant->phone,
            'plan' => $plan->id,
            'billing_period_id' => $period->id,
            'status' => 1,
            'payment' => false,
        ])
        ->assertRedirect();

    $tenant->refresh();

    expect($tenant->trial_ends_at)->not->toBeNull()
        ->and($tenant->isOnTrial())->toBeTrue()
        ->and($tenant->subscriptionStatus())->toBe('Em teste');
});
