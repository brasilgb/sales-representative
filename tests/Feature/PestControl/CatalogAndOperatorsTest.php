<?php

use App\Models\PestControl\ControlPoint;
use App\Models\PestControl\Establishment;
use App\Models\PestControl\Lookup;
use App\Models\PestControl\PestSpecies;
use App\Models\PestControl\Product;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\User;
use App\Services\PestControl\PestControlPermissions;
use App\Services\TenantModuleService;
use Inertia\Testing\AssertableInertia as Assert;

function catTenant(string $suffix): Tenant
{
    return Tenant::create([
        'company' => "Empresa CAT {$suffix}",
        'cnpj' => "6666600000{$suffix}",
        'email' => "cat-{$suffix}@example.com",
        'status' => 1,
        'payment' => true,
        'expiration_date' => now()->addYear(),
        'plan_type' => Tenant::PLAN_INDIVIDUAL,
    ]);
}

function catOwner(Tenant $tenant, string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "Dono CAT {$suffix}",
        'email' => "owner-cat-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_OWNER,
        'status' => 1,
    ]);
}

function catSeller(Tenant $tenant, string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "Vendedor CAT {$suffix}",
        'email' => "seller-cat-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_SELLER,
        'status' => 1,
    ]);
}

function catRoot(string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'name' => "Root CAT {$suffix}",
        'email' => "root-cat-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_ROOT,
        'status' => true,
    ]);
}

function catActivateModule(Tenant $tenant, User $root): void
{
    app(TenantModuleService::class)->activate($tenant, TenantModule::KEY_PEST_CONTROL, $root);
}

test('owner manages products, species and lookups, all scoped to the tenant', function () {
    $tenant = catTenant('1');
    $owner = catOwner($tenant, '1');
    catActivateModule($tenant, catRoot('1'));

    $this->actingAs($owner)->post(route('app.pest-control.catalog.products.store'), [
        'name' => 'Raticida Bloco X',
        'default_consumption_type' => 'bloco',
    ])->assertRedirect();

    $product = Product::where('tenant_id', $tenant->id)->firstOrFail();
    expect($product->name)->toBe('Raticida Bloco X');

    $this->actingAs($owner)->patch(route('app.pest-control.catalog.products.update', $product), [
        'name' => 'Raticida Bloco X',
        'active' => false,
    ])->assertRedirect();
    expect($product->fresh()->active)->toBeFalse();

    $this->actingAs($owner)->post(route('app.pest-control.catalog.species.store'), [
        'name' => 'Rato de telhado',
        'category_key' => 'roedores',
    ])->assertRedirect();
    expect(PestSpecies::where('tenant_id', $tenant->id)->where('name', 'Rato de telhado')->exists())->toBeTrue();

    $this->actingAs($owner)->post(route('app.pest-control.catalog.lookups.store', 'point_category'), [
        'key' => 'aves',
        'name' => 'Aves',
    ])->assertRedirect();
    expect(Lookup::where('tenant_id', $tenant->id)->where('key', 'aves')->exists())->toBeTrue();
});

test('a seller without settings.manage cannot see or change the catalog', function () {
    $tenant = catTenant('2');
    $seller = catSeller($tenant, '2');
    catActivateModule($tenant, catRoot('2'));

    $this->actingAs($seller)->get(route('app.pest-control.catalog.index'))->assertForbidden();
    $this->actingAs($seller)
        ->post(route('app.pest-control.catalog.products.store'), ['name' => 'Bloqueado'])
        ->assertForbidden();

    expect(Product::where('tenant_id', $tenant->id)->count())->toBe(0);
});

test('product and species names are unique per tenant, not globally', function () {
    $tenantA = catTenant('3');
    $tenantB = catTenant('4');
    $ownerA = catOwner($tenantA, '3');
    catActivateModule($tenantA, catRoot('3'));
    Product::create(['tenant_id' => $tenantB->id, 'name' => 'Isca Padrão']);

    $this->actingAs($ownerA)
        ->post(route('app.pest-control.catalog.products.store'), ['name' => 'Isca Padrão'])
        ->assertRedirect();

    expect(Product::where('tenant_id', $tenantA->id)->where('name', 'Isca Padrão')->exists())->toBeTrue();
});

test('deleting a product used as a control point default is blocked', function () {
    $tenant = catTenant('5');
    $owner = catOwner($tenant, '5');
    catActivateModule($tenant, catRoot('5'));
    $product = Product::create(['tenant_id' => $tenant->id, 'name' => 'Isca em uso']);
    $establishment = Establishment::create(['tenant_id' => $tenant->id, 'name' => 'Estab']);
    ControlPoint::create([
        'tenant_id' => $tenant->id,
        'establishment_id' => $establishment->id,
        'code' => 'P-1',
        'default_product_id' => $product->id,
    ]);

    $this->actingAs($owner)
        ->delete(route('app.pest-control.catalog.products.destroy', $product))
        ->assertRedirect()
        ->assertSessionHas('error');

    expect(Product::find($product->id))->not->toBeNull();
});

test('operators index lists non-owner tenant users with their effective permissions', function () {
    $tenant = catTenant('6');
    $owner = catOwner($tenant, '6');
    $seller = catSeller($tenant, '6');
    catActivateModule($tenant, catRoot('6'));
    app(PestControlPermissions::class)->grant($seller, 'pest_control.visits.create', $owner);

    $this->actingAs($owner)
        ->get(route('app.pest-control.operators.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('app/pest-control/operators/index')
            ->has('users', 1)
            ->where('users.0.id', $seller->id)
            ->where('users.0.permissions', ['pest_control.visits.create']));
});

test('operators.manage grants and revokes a permission for a seller, and the owner cannot be targeted', function () {
    $tenant = catTenant('7');
    $owner = catOwner($tenant, '7');
    $seller = catSeller($tenant, '7');
    catActivateModule($tenant, catRoot('7'));

    $this->actingAs($owner)->patch(route('app.pest-control.operators.update', $seller), [
        'permissions' => ['pest_control.visits.view', 'pest_control.visits.create'],
    ])->assertRedirect();

    expect(app(PestControlPermissions::class)->effectivePermissions($seller))
        ->toEqualCanonicalizing(['pest_control.visits.view', 'pest_control.visits.create']);

    $this->actingAs($owner)->patch(route('app.pest-control.operators.update', $seller), [
        'permissions' => [],
    ])->assertRedirect();

    expect(app(PestControlPermissions::class)->effectivePermissions($seller))->toBe([]);

    $this->actingAs($owner)
        ->patch(route('app.pest-control.operators.update', $owner), ['permissions' => ['pest_control.visits.view']])
        ->assertStatus(422);
});

test('a seller without operators.manage cannot change other users permissions', function () {
    $tenant = catTenant('8');
    $sellerA = catSeller($tenant, '8-a');
    $sellerB = catSeller($tenant, '8-b');
    catActivateModule($tenant, catRoot('8'));

    $this->actingAs($sellerA)
        ->patch(route('app.pest-control.operators.update', $sellerB), ['permissions' => ['pest_control.visits.view']])
        ->assertForbidden();
});
