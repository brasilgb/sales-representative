<?php

use App\Models\PestControl\Lookup;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\User;
use App\Services\PestControl\PestControlPermissions;
use App\Services\PestControl\PestControlProvisioner;
use App\Services\TenantModuleService;

function pc3Tenant(string $suffix): Tenant
{
    return Tenant::create([
        'company' => "Empresa PC3 {$suffix}",
        'cnpj' => "4444400000{$suffix}",
        'email' => "pc3-{$suffix}@example.com",
        'status' => 1,
        'payment' => true,
        'expiration_date' => now()->addYear(),
        'plan_type' => Tenant::PLAN_INDIVIDUAL,
    ]);
}

function pc3Owner(Tenant $tenant, string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "Dono PC3 {$suffix}",
        'email' => "owner-pc3-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_OWNER,
        'status' => 1,
    ]);
}

function pc3Seller(Tenant $tenant, string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "Vendedor PC3 {$suffix}",
        'email' => "seller-pc3-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_SELLER,
        'status' => 1,
    ]);
}

function pc3Root(string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'name' => "Root PC3 {$suffix}",
        'email' => "root-pc3-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_ROOT,
        'status' => true,
    ]);
}

test('activating the module seeds default point categories and consumption types once', function () {
    $tenant = pc3Tenant('1');
    $root = pc3Root('1');
    $service = app(TenantModuleService::class);

    $service->activate($tenant, TenantModule::KEY_PEST_CONTROL, $root);

    expect(Lookup::where('tenant_id', $tenant->id)->where('group', Lookup::GROUP_POINT_CATEGORY)->count())->toBe(3)
        ->and(Lookup::where('tenant_id', $tenant->id)->where('group', Lookup::GROUP_CONSUMPTION_TYPE)->count())->toBe(7)
        ->and(Lookup::where('tenant_id', $tenant->id)->where('key', 'roedores')->exists())->toBeTrue();
});

test('provisioning does not leak between tenants and does not duplicate on reactivation', function () {
    $tenantA = pc3Tenant('2');
    $tenantB = pc3Tenant('3');
    $root = pc3Root('2');
    $service = app(TenantModuleService::class);

    $service->activate($tenantA, TenantModule::KEY_PEST_CONTROL, $root);

    expect(Lookup::where('tenant_id', $tenantB->id)->count())->toBe(0);

    // Tenant customiza uma categoria antes de qualquer suspensão/reativação.
    Lookup::where('tenant_id', $tenantA->id)->where('key', 'roedores')->update(['name' => 'Roedores (urbano)']);

    $service->suspend($tenantA, TenantModule::KEY_PEST_CONTROL, $root);
    $service->reactivate($tenantA, TenantModule::KEY_PEST_CONTROL, $root);
    app(PestControlProvisioner::class)->provisionForTenant($tenantA);

    expect(Lookup::where('tenant_id', $tenantA->id)->where('group', Lookup::GROUP_POINT_CATEGORY)->count())->toBe(3)
        ->and(Lookup::where('tenant_id', $tenantA->id)->where('key', 'roedores')->value('name'))->toBe('Roedores (urbano)');
});

test('owner and root have implicit access to every permission without explicit grants', function () {
    $tenant = pc3Tenant('4');
    $owner = pc3Owner($tenant, '4');
    $root = pc3Root('3');
    $permissions = app(PestControlPermissions::class);

    foreach ($permissions->all() as $permission) {
        expect($permissions->has($owner, $permission))->toBeTrue()
            ->and($permissions->has($root, $permission))->toBeTrue();
    }
});

test('a seller has no permission until explicitly granted, and only that permission', function () {
    $tenant = pc3Tenant('5');
    $seller = pc3Seller($tenant, '5');
    $owner = pc3Owner($tenant, '5');
    $permissions = app(PestControlPermissions::class);

    expect($permissions->has($seller, 'pest_control.units.view'))->toBeFalse();

    $permissions->grant($seller, 'pest_control.units.view', $owner);

    expect($permissions->has($seller, 'pest_control.units.view'))->toBeTrue()
        ->and($permissions->has($seller, 'pest_control.units.manage'))->toBeFalse();
});

test('sync replaces the full permission set for a user', function () {
    $tenant = pc3Tenant('6');
    $seller = pc3Seller($tenant, '6');
    $owner = pc3Owner($tenant, '6');
    $permissions = app(PestControlPermissions::class);

    $permissions->grant($seller, 'pest_control.units.view', $owner);
    $permissions->sync($seller, ['pest_control.points.view', 'pest_control.points.manage'], $owner);

    expect($permissions->effectivePermissions($seller))->toEqualCanonicalizing([
        'pest_control.points.view',
        'pest_control.points.manage',
    ]);
});
