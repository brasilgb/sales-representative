<?php

use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;

function stockAdjustmentTenant(string $suffix): Tenant
{
    return Tenant::create([
        'company' => "Empresa Estoque {$suffix}",
        'cnpj' => "0000000001{$suffix}",
        'email' => "empresa-estoque-{$suffix}@example.com",
        'status' => 1,
        'payment' => true,
        'expiration_date' => now()->addYear(),
        'plan_type' => Tenant::PLAN_INDIVIDUAL,
    ]);
}

function stockAdjustmentOwner(Tenant $tenant, string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "Admin Estoque {$suffix}",
        'email' => "admin-estoque-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_OWNER,
        'status' => 1,
    ]);
}

function stockAdjustmentSeller(Tenant $tenant, string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "Vendedor Estoque {$suffix}",
        'email' => "vendedor-estoque-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_SELLER,
        'status' => 1,
    ]);
}

function stockAdjustmentProduct(Tenant $tenant, string $suffix, int $quantity = 10): Product
{
    $product = new Product([
        'name' => "Produto Estoque {$suffix}",
        'reference' => "REF-ESTOQUE-{$suffix}",
        'description' => 'Produto de teste',
        'unity' => 'UN',
        'measure' => 1,
        'price' => 10,
        'quantity' => $quantity,
        'min_quantity' => 1,
        'enabled' => true,
    ]);
    $product->tenant_id = $tenant->id;
    $product->save();

    return $product;
}

test('editing a product does not change its stock quantity', function () {
    $tenant = stockAdjustmentTenant('01');
    $owner = stockAdjustmentOwner($tenant, '01');
    $product = stockAdjustmentProduct($tenant, '01', 10);

    $this->actingAs($owner)
        ->patch(route('app.products.update', $product->id), [
            'name' => 'Produto Renomeado',
            'reference' => $product->reference,
            'description' => $product->description,
            'unity' => $product->unity,
            'measure' => $product->measure,
            'price' => $product->price,
            'quantity' => 9999,
            'min_quantity' => 1,
            'enabled' => true,
        ])
        ->assertRedirect();

    expect($product->fresh()->quantity)->toBe(10);
});

test('owner can increase product stock with a positive adjustment', function () {
    $tenant = stockAdjustmentTenant('02');
    $owner = stockAdjustmentOwner($tenant, '02');
    $product = stockAdjustmentProduct($tenant, '02', 10);

    $this->actingAs($owner)
        ->patch(route('app.products.adjust-stock', $product->id), ['adjustment' => 50])
        ->assertRedirect();

    expect($product->fresh()->quantity)->toBe(60);
});

test('owner can decrease product stock with a negative adjustment', function () {
    $tenant = stockAdjustmentTenant('03');
    $owner = stockAdjustmentOwner($tenant, '03');
    $product = stockAdjustmentProduct($tenant, '03', 10);

    $this->actingAs($owner)
        ->patch(route('app.products.adjust-stock', $product->id), ['adjustment' => -3])
        ->assertRedirect();

    expect($product->fresh()->quantity)->toBe(7);
});

test('stock adjustment is rejected when it would leave stock negative', function () {
    $tenant = stockAdjustmentTenant('04');
    $owner = stockAdjustmentOwner($tenant, '04');
    $product = stockAdjustmentProduct($tenant, '04', 5);

    $this->actingAs($owner)
        ->patch(route('app.products.adjust-stock', $product->id), ['adjustment' => -6])
        ->assertSessionHasErrors('adjustment');

    expect($product->fresh()->quantity)->toBe(5);
});

test('stock adjustment rejects a zero value', function () {
    $tenant = stockAdjustmentTenant('05');
    $owner = stockAdjustmentOwner($tenant, '05');
    $product = stockAdjustmentProduct($tenant, '05', 5);

    $this->actingAs($owner)
        ->patch(route('app.products.adjust-stock', $product->id), ['adjustment' => 0])
        ->assertSessionHasErrors('adjustment');

    expect($product->fresh()->quantity)->toBe(5);
});

test('a seller without product management permission cannot adjust stock', function () {
    $tenant = stockAdjustmentTenant('06');
    $seller = stockAdjustmentSeller($tenant, '06');
    $product = stockAdjustmentProduct($tenant, '06', 5);

    $this->actingAs($seller)
        ->patch(route('app.products.adjust-stock', $product->id), ['adjustment' => 10])
        ->assertForbidden();

    expect($product->fresh()->quantity)->toBe(5);
});
