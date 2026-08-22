<?php

use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\User;
use App\Services\TenantModuleService;
use Laravel\Sanctum\Sanctum;

function pestControlTenant(string $suffix): Tenant
{
    return Tenant::create([
        'company' => "Empresa Pragas {$suffix}",
        'cnpj' => "2222200000{$suffix}",
        'email' => "pragas{$suffix}@example.com",
        'status' => 1,
        'payment' => true,
        'expiration_date' => now()->addYear(),
        'plan_type' => Tenant::PLAN_INDIVIDUAL,
    ]);
}

function pestControlOwner(Tenant $tenant, string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "Dono Pragas {$suffix}",
        'email' => "owner-pragas-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_OWNER,
        'status' => 1,
    ]);
}

test('web route is invisible to a tenant that never contracted the module', function () {
    $tenant = pestControlTenant('1');
    $owner = pestControlOwner($tenant, '1');

    $this->actingAs($owner)
        ->get('/app/pest-control')
        ->assertNotFound();
});

test('web route stays blocked while the module is suspended or canceled', function () {
    $tenant = pestControlTenant('2');
    $owner = pestControlOwner($tenant, '2');
    $root = User::withoutGlobalScopes()->create([
        'name' => 'Root Pragas 2',
        'email' => 'root-pragas-2@example.com',
        'password' => 'password',
        'roles' => User::ROLE_ROOT,
        'status' => true,
    ]);
    $service = app(TenantModuleService::class);

    $service->activate($tenant, TenantModule::KEY_PEST_CONTROL, $root);
    $this->actingAs($owner)->get('/app/pest-control')->assertRedirect(route('app.pest-control.establishments.index'));

    $service->suspend($tenant, TenantModule::KEY_PEST_CONTROL, $root);
    $this->actingAs($owner)->get('/app/pest-control')->assertNotFound();

    $service->reactivate($tenant, TenantModule::KEY_PEST_CONTROL, $root);
    $this->actingAs($owner)->get('/app/pest-control')->assertRedirect(route('app.pest-control.establishments.index'));

    $service->cancel($tenant, TenantModule::KEY_PEST_CONTROL, $root);
    $this->actingAs($owner)->get('/app/pest-control')->assertNotFound();
});

test('one tenant contracting the module does not grant access to another tenant', function () {
    $tenantWithModule = pestControlTenant('3');
    $tenantWithoutModule = pestControlTenant('4');
    $ownerWithoutModule = pestControlOwner($tenantWithoutModule, '4');
    $root = User::withoutGlobalScopes()->create([
        'name' => 'Root Pragas 3',
        'email' => 'root-pragas-3@example.com',
        'password' => 'password',
        'roles' => User::ROLE_ROOT,
        'status' => true,
    ]);

    app(TenantModuleService::class)->activate($tenantWithModule, TenantModule::KEY_PEST_CONTROL, $root);

    $this->actingAs($ownerWithoutModule)
        ->get('/app/pest-control')
        ->assertNotFound();
});

test('api endpoint requires authentication and then denies tenants without the module', function () {
    $tenant = pestControlTenant('5');
    $owner = pestControlOwner($tenant, '5');
    $root = User::withoutGlobalScopes()->create([
        'name' => 'Root Pragas 5',
        'email' => 'root-pragas-5@example.com',
        'password' => 'password',
        'roles' => User::ROLE_ROOT,
        'status' => true,
    ]);

    $this->getJson('/api/pest-control/v1/status')->assertUnauthorized();

    Sanctum::actingAs($owner);
    $this->getJson('/api/pest-control/v1/status')->assertNotFound();

    app(TenantModuleService::class)->activate($tenant, TenantModule::KEY_PEST_CONTROL, $root);
    $this->getJson('/api/pest-control/v1/status')->assertOk()->assertJson(['status' => 'active']);
});

test('a superadmin without a tenant does not get access to the tenant-scoped module route', function () {
    $root = User::withoutGlobalScopes()->create([
        'name' => 'Root Sem Tenant',
        'email' => 'root-sem-tenant@example.com',
        'password' => 'password',
        'roles' => User::ROLE_ROOT,
        'status' => true,
    ]);

    // Root opera pelo painel admin; a rota "app" nem se aplica a ele, mas o
    // gate do módulo também precisa negar por segurança caso alguém tente.
    $this->actingAs($root)->get('/app/pest-control')->assertRedirect(route('admin.dashboard'));
});
