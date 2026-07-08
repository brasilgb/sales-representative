<?php

use App\Models\Admin\Plan;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function catalogTenant(string $planSlug, string $suffix): Tenant
{
    $plan = Plan::where('slug', $planSlug)->firstOrFail();

    return Tenant::create([
        'plan' => $plan->id,
        'plan_type' => $plan->account_type,
        'company' => "Empresa catálogo {$suffix}",
        'cnpj' => "2000000000000{$suffix}",
        'email' => "catalog-{$suffix}@example.com",
        'status' => 1,
        'payment' => true,
        'expiration_date' => now()->addYear(),
    ]);
}

function catalogUser(Tenant $tenant, int $role, string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "Usuário catálogo {$suffix}",
        'email' => "catalog-user-{$suffix}@example.com",
        'password' => 'password',
        'roles' => $role,
        'status' => 1,
    ]);
}

test('team seller can consult but cannot manage customers or products', function () {
    $tenant = catalogTenant('equipe', 'team-seller');
    $seller = catalogUser($tenant, User::ROLE_SELLER, 'team-seller');

    Sanctum::actingAs($seller);

    $this->getJson('/api/user')
        ->assertOk()
        ->assertJsonPath('account_type', Tenant::PLAN_TEAM)
        ->assertJsonPath('can_manage_catalog', false)
        ->assertJsonPath('public_catalog_url', route('catalog.public', [
            'token' => $tenant->public_catalog_token,
            'v' => $tenant->updated_at?->timestamp,
        ]));

    $this->getJson('/api/customers')->assertOk();
    $this->getJson('/api/products')->assertOk();
    $this->postJson('/api/customers', [])->assertForbidden();
    $this->postJson('/api/products', [])->assertForbidden();
});

test('team owner and individual seller can manage the catalog', function () {
    $teamTenant = catalogTenant('equipe', 'team-owner');
    $teamOwner = catalogUser($teamTenant, User::ROLE_OWNER, 'team-owner');

    expect($teamOwner->canManageCatalog())->toBeTrue();

    Sanctum::actingAs($teamOwner);
    $this->getJson('/api/user')->assertJsonPath('can_manage_catalog', true);
    $this->postJson('/api/customers', [])->assertUnprocessable();
    $this->postJson('/api/products', [])->assertUnprocessable();

    $individualTenant = catalogTenant('solo', 'individual-seller');
    $individualSeller = catalogUser($individualTenant, User::ROLE_SELLER, 'individual-seller');

    expect($individualSeller->canManageCatalog())->toBeTrue();

    Sanctum::actingAs($individualSeller);
    $this->getJson('/api/user')
        ->assertJsonPath('account_type', Tenant::PLAN_INDIVIDUAL)
        ->assertJsonPath('can_manage_catalog', true);
});

test('team seller cannot alter or delete existing catalog records', function () {
    $tenant = catalogTenant('equipe', 'existing-records');
    $seller = catalogUser($tenant, User::ROLE_SELLER, 'existing-records');

    $customer = new Customer([
        'name' => 'Cliente da equipe',
        'cnpj' => '04252011000110',
        'email' => 'cliente-equipe@example.com',
    ]);
    $customer->tenant_id = $tenant->id;
    $customer->save();

    $product = new Product([
        'name' => 'Produto da equipe',
        'reference' => 'TEAM-001',
        'description' => 'Produto de teste',
        'unity' => 'UN',
        'measure' => 1,
        'price' => 10,
        'quantity' => 10,
        'min_quantity' => 1,
        'enabled' => true,
    ]);
    $product->tenant_id = $tenant->id;
    $product->save();

    Sanctum::actingAs($seller);

    $this->putJson("/api/customers/{$customer->id}", [])->assertForbidden();
    $this->deleteJson("/api/customers/{$customer->id}")->assertForbidden();
    $this->putJson("/api/products/{$product->id}", [])->assertForbidden();
    $this->deleteJson("/api/products/{$product->id}")->assertForbidden();
});
