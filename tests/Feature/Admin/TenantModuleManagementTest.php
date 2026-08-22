<?php

use App\Models\Admin\Plan;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\TenantModuleLog;
use App\Models\User;

function moduleTestRoot(string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'name' => "Root {$suffix}",
        'email' => "root-module-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_ROOT,
        'status' => true,
    ]);
}

function moduleTestTenant(string $suffix): Tenant
{
    return Tenant::create([
        'company' => "Empresa Módulo {$suffix}",
        'cnpj' => "1111100000{$suffix}",
        'email' => "modulo{$suffix}@example.com",
        'status' => 1,
        'payment' => true,
        'expiration_date' => now()->addDays(15),
        'plan_type' => Tenant::PLAN_INDIVIDUAL,
    ]);
}

function moduleTestOwner(Tenant $tenant, string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "Dono {$suffix}",
        'email' => "owner-module-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_OWNER,
        'status' => 1,
    ]);
}

test('rootAdmin can activate, suspend, cancel and reactivate a module for a tenant', function () {
    $root = moduleTestRoot('1');
    $tenant = moduleTestTenant('1');

    $this->actingAs($root)
        ->post(route('admin.tenants.modules.activate', ['tenant' => $tenant->id, 'module' => 'pest_control']))
        ->assertRedirect();

    $tenantModule = TenantModule::where('tenant_id', $tenant->id)->where('module_key', 'pest_control')->firstOrFail();
    expect($tenantModule->status)->toBe(TenantModule::STATUS_ACTIVE)
        ->and($tenantModule->activated_at)->not->toBeNull()
        ->and($tenantModule->logs()->count())->toBe(1)
        ->and($tenantModule->logs()->first()->action)->toBe(TenantModuleLog::ACTION_ACTIVATED)
        ->and($tenantModule->logs()->first()->performed_by)->toBe($root->id);

    $this->actingAs($root)
        ->patch(route('admin.tenants.modules.suspend', ['tenant' => $tenant->id, 'module' => 'pest_control']))
        ->assertRedirect();

    expect($tenantModule->fresh()->status)->toBe(TenantModule::STATUS_SUSPENDED);

    $this->actingAs($root)
        ->patch(route('admin.tenants.modules.reactivate', ['tenant' => $tenant->id, 'module' => 'pest_control']))
        ->assertRedirect();

    $reactivated = $tenantModule->fresh();
    expect($reactivated->status)->toBe(TenantModule::STATUS_ACTIVE)
        ->and($reactivated->logs()->count())->toBe(3)
        ->and($reactivated->logs()->first()->action)->toBe(TenantModuleLog::ACTION_REACTIVATED);

    $this->actingAs($root)
        ->patch(route('admin.tenants.modules.cancel', ['tenant' => $tenant->id, 'module' => 'pest_control']))
        ->assertRedirect();

    $canceled = $tenantModule->fresh();
    expect($canceled->status)->toBe(TenantModule::STATUS_CANCELED)
        // cancelamento não apaga o registro nem o histórico
        ->and(TenantModule::find($tenantModule->id))->not->toBeNull()
        ->and($canceled->logs()->count())->toBe(4);
});

test('a tenant user cannot manage module activation', function () {
    $tenant = moduleTestTenant('2');
    $owner = moduleTestOwner($tenant, '2');

    $this->actingAs($owner)
        ->post(route('admin.tenants.modules.activate', ['tenant' => $tenant->id, 'module' => 'pest_control']))
        ->assertRedirect(route('app.dashboard'));

    expect(TenantModule::where('tenant_id', $tenant->id)->exists())->toBeFalse();
});

test('activating an unknown module key is rejected', function () {
    $root = moduleTestRoot('3');
    $tenant = moduleTestTenant('3');

    $this->actingAs($root)
        ->post(route('admin.tenants.modules.activate', ['tenant' => $tenant->id, 'module' => 'not-a-real-module']))
        ->assertNotFound();
});

test('suspending a module never contracted is rejected', function () {
    $root = moduleTestRoot('4');
    $tenant = moduleTestTenant('4');

    $this->actingAs($root)
        ->patch(route('admin.tenants.modules.suspend', ['tenant' => $tenant->id, 'module' => 'pest_control']))
        ->assertNotFound();
});

test('activation mid-cycle records a prorated reference amount, without generating any automatic charge', function () {
    $root = moduleTestRoot('5');
    $tenant = moduleTestTenant('5');
    $plan = Plan::where('slug', 'solo')->firstOrFail();
    $monthlyPeriod = $plan->periods()->where('interval_count', 1)->firstOrFail();
    $tenant->update([
        'plan' => $plan->id,
        'billing_period_id' => $monthlyPeriod->id,
        'expiration_date' => now()->addDays(15),
    ]);

    $this->actingAs($root)
        ->post(route('admin.tenants.modules.activate', ['tenant' => $tenant->id, 'module' => 'pest_control']))
        ->assertRedirect();

    $tenantModule = TenantModule::where('tenant_id', $tenant->id)->firstOrFail();
    $log = $tenantModule->logs()->firstOrFail();

    // Meio do ciclo mensal (R$ 30,00): valor de referência entre 0 e o preço
    // cheio do módulo, nunca acima dele. Isso não gera nenhuma cobrança
    // automática, apenas orienta o rootAdmin.
    expect((float) $log->prorated_amount)->toBeGreaterThan(0)
        ->and((float) $log->prorated_amount)->toBeLessThan(30.0);
});

test('activation without a billing cycle configured records no prorated amount', function () {
    $root = moduleTestRoot('6');
    $tenant = moduleTestTenant('6');
    $tenant->update(['expiration_date' => now()->addDays(15)]);

    $this->actingAs($root)
        ->post(route('admin.tenants.modules.activate', ['tenant' => $tenant->id, 'module' => 'pest_control']))
        ->assertRedirect();

    $tenantModule = TenantModule::where('tenant_id', $tenant->id)->firstOrFail();

    expect($tenantModule->logs()->firstOrFail()->prorated_amount)->toBeNull();
});
