<?php

use App\Models\PestControl\ControlPoint;
use App\Models\PestControl\Establishment;
use App\Models\PestControl\Lookup;
use App\Models\PestControl\PestSpecies;
use App\Models\PestControl\Product;
use App\Models\PestControl\Technician;
use App\Models\Tenant;
use App\Models\TenantModule;
use App\Models\User;
use App\Services\TenantModuleService;
use Illuminate\Support\Facades\Hash;
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

test('operators index lists only technicians registered in the module, not every seller', function () {
    $tenant = catTenant('6');
    $owner = catOwner($tenant, '6');
    catSeller($tenant, '6'); // vendedor comum, não cadastrado como técnico: não deve aparecer
    catActivateModule($tenant, catRoot('6'));

    $technicianUser = catSeller($tenant, '6-tech');
    Technician::create(['tenant_id' => $tenant->id, 'user_id' => $technicianUser->id]);

    $this->actingAs($owner)
        ->get(route('app.pest-control.operators.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('app/pest-control/operators/index')
            ->has('users', 1)
            ->where('users.0.id', $technicianUser->id));
});

test('owner creates a technician/operator from within the module, reusing the users table, without any permission grant', function () {
    $tenant = catTenant('9');
    $owner = catOwner($tenant, '9');
    catActivateModule($tenant, catRoot('9'));

    $this->actingAs($owner)->post(route('app.pest-control.operators.store'), [
        'name' => 'Técnico Novo',
        'email' => 'tecnico-cat-9@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertRedirect(route('app.pest-control.operators.index'));

    $technician = User::where('email', 'tecnico-cat-9@example.com')->firstOrFail();
    expect($technician->tenant_id)->toBe($tenant->id);
    expect($technician->roles)->toEqual(User::ROLE_SELLER);
    expect($technician->isPestControlTechnician())->toBeTrue();

    // O cadastro é feito dentro do módulo, na tela de técnicos/operadores.
    $this->actingAs($owner)
        ->get(route('app.pest-control.operators.index'))
        ->assertInertia(fn (Assert $page) => $page->where('users.0.id', $technician->id));
});

test('a seller without operators.manage cannot create technicians/operators', function () {
    $tenant = catTenant('10');
    $seller = catSeller($tenant, '10');
    catActivateModule($tenant, catRoot('10'));

    $this->actingAs($seller)->get(route('app.pest-control.operators.create'))->assertForbidden();

    $this->actingAs($seller)->post(route('app.pest-control.operators.store'), [
        'name' => 'Bloqueado',
        'email' => 'bloqueado-cat-10@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertForbidden();

    expect(User::where('email', 'bloqueado-cat-10@example.com')->exists())->toBeFalse();
});

test('owner edits technician information and changes their app password', function () {
    $tenant = catTenant('12');
    $owner = catOwner($tenant, '12');
    catActivateModule($tenant, catRoot('12'));

    $technician = catSeller($tenant, '12-tech');
    Technician::create(['tenant_id' => $tenant->id, 'user_id' => $technician->id]);

    $this->actingAs($owner)
        ->get(route('app.pest-control.operators.edit', $technician))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('app/pest-control/operators/edit-operator')
            ->where('operator.id', $technician->id)
            ->where('operator.email', $technician->email));

    $this->actingAs($owner)
        ->put(route('app.pest-control.operators.update', $technician), [
            'name' => 'Técnico Atualizado',
            'email' => 'tecnico-atualizado@example.com',
            'telephone' => '11999998888',
            'whatsapp' => '11988887777',
            'status' => false,
            'password' => 'nova-senha-123',
            'password_confirmation' => 'nova-senha-123',
        ])
        ->assertRedirect(route('app.pest-control.operators.index'))
        ->assertSessionHas('success');

    $technician->refresh();

    expect($technician->name)->toBe('Técnico Atualizado')
        ->and($technician->email)->toBe('tecnico-atualizado@example.com')
        ->and($technician->telephone)->toBe('11999998888')
        ->and($technician->whatsapp)->toBe('11988887777')
        ->and((bool) $technician->status)->toBeFalse()
        ->and(Hash::check('nova-senha-123', $technician->password))->toBeTrue();
});

test('updating a technician without a new password keeps the current password', function () {
    $tenant = catTenant('13');
    $owner = catOwner($tenant, '13');
    catActivateModule($tenant, catRoot('13'));

    $technician = catSeller($tenant, '13-tech');
    Technician::create(['tenant_id' => $tenant->id, 'user_id' => $technician->id]);
    $currentPassword = $technician->password;

    $this->actingAs($owner)
        ->put(route('app.pest-control.operators.update', $technician), [
            'name' => 'Somente Nome',
            'email' => $technician->email,
            'telephone' => '',
            'whatsapp' => '',
            'status' => true,
            'password' => '',
            'password_confirmation' => '',
        ])
        ->assertRedirect(route('app.pest-control.operators.index'));

    expect($technician->fresh()->password)->toBe($currentPassword);
});

test('seller cannot edit technicians and a regular seller cannot be edited through operator routes', function () {
    $tenant = catTenant('14');
    $owner = catOwner($tenant, '14');
    $seller = catSeller($tenant, '14');
    $technician = catSeller($tenant, '14-tech');
    Technician::create(['tenant_id' => $tenant->id, 'user_id' => $technician->id]);
    catActivateModule($tenant, catRoot('14'));

    $this->actingAs($seller)
        ->get(route('app.pest-control.operators.edit', $technician))
        ->assertForbidden();

    $this->actingAs($owner)
        ->get(route('app.pest-control.operators.edit', $seller))
        ->assertNotFound();
});
