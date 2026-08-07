<?php

use App\Models\Customer;
use App\Models\Flex;
use App\Models\Order;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;

function adminFlexTenant(string $suffix): Tenant
{
    return Tenant::create([
        'company' => "Empresa Flex {$suffix}",
        'cnpj' => "0000000000{$suffix}",
        'email' => "empresa-flex-{$suffix}@example.com",
        'status' => 1,
        'payment' => true,
        'expiration_date' => now()->addYear(),
        'plan_type' => Tenant::PLAN_INDIVIDUAL,
    ]);
}

function adminFlexOwner(Tenant $tenant, string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "Admin Flex {$suffix}",
        'email' => "admin-flex-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_OWNER,
        'status' => 1,
    ]);
}

function adminFlexSeller(Tenant $tenant, string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "Vendedor Flex {$suffix}",
        'email' => "seller-flex-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_SELLER,
        'status' => 1,
    ]);
}

function adminFlexCustomer(Tenant $tenant, User $owner, string $suffix): Customer
{
    $customer = new Customer([
        'user_id' => $owner->id,
        'name' => "Cliente Flex {$suffix}",
        'cnpj' => "1000000000{$suffix}",
        'email' => "cliente-flex-{$suffix}@example.com",
        'phone' => '11999999999',
    ]);
    $customer->tenant_id = $tenant->id;
    $customer->save();

    return $customer;
}

function adminFlexProduct(Tenant $tenant, string $suffix): Product
{
    $product = new Product([
        'name' => "Produto Flex {$suffix}",
        'reference' => "REF-FLEX-{$suffix}",
        'description' => 'Produto de teste',
        'unity' => 'UN',
        'measure' => 1,
        'price' => 100,
        'quantity' => 10,
        'min_quantity' => 1,
        'enabled' => true,
    ]);
    $product->tenant_id = $tenant->id;
    $product->save();

    return $product;
}

test('only the owner can update the admin flex setting', function () {
    $tenant = adminFlexTenant('01');
    $seller = adminFlexSeller($tenant, '01');

    $this->actingAs($seller)
        ->patch(route('app.other-settings.admin-flex.update'), ['admin_flex' => 500])
        ->assertForbidden();

    expect($tenant->fresh()->admin_flex)->toBeNull();
});

test('owner can set and clear the admin flex universal value', function () {
    $tenant = adminFlexTenant('02');
    $owner = adminFlexOwner($tenant, '02');

    $this->actingAs($owner)
        ->patch(route('app.other-settings.admin-flex.update'), ['admin_flex' => 500])
        ->assertRedirect();

    expect((float) $tenant->fresh()->admin_flex)->toBe(500.0);

    $this->actingAs($owner)
        ->patch(route('app.other-settings.admin-flex.update'), ['admin_flex' => ''])
        ->assertRedirect();

    expect($tenant->fresh()->admin_flex)->toBeNull();
});

test('order create page shows the admin flex universal value to the owner instead of the real balance', function () {
    $tenant = adminFlexTenant('03');
    $owner = adminFlexOwner($tenant, '03');
    $tenant->update(['admin_flex' => 300]);
    $this->actingAs($owner);
    Flex::create(['value' => 10]);

    $this->get(route('app.orders.create'))
        ->assertInertia(fn ($page) => $page
            ->where('flex.value', 300)
            ->where('flex.is_admin_override', true));
});

test('seller still sees the real shared flex balance even when the owner has a universal value set', function () {
    $tenant = adminFlexTenant('04');
    $seller = adminFlexSeller($tenant, '04');
    $tenant->update(['admin_flex' => 300]);
    $this->actingAs($seller);
    Flex::create(['value' => 10]);

    $this->get(route('app.orders.create'))
        ->assertInertia(fn ($page) => $page
            ->where('flex.value', 10)
            ->where('flex.is_admin_override', false));
});

test('owner order discount is unlocked by the admin flex universal value without touching the real team balance', function () {
    $tenant = adminFlexTenant('05');
    $owner = adminFlexOwner($tenant, '05');
    $customer = adminFlexCustomer($tenant, $owner, '05');
    $product = adminFlexProduct($tenant, '05');
    $tenant->update(['admin_flex' => 500]);
    $this->actingAs($owner);
    $balance = Flex::create(['value' => 5]);

    // Desconto de 200 excede em muito o saldo real (5), mas está dentro do Flex Universal (500).
    $response = $this->post(route('app.orders.store'), [
        'customer_id' => $customer->id,
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 3,
            'price' => 100,
            'name' => $product->name,
            'total' => 300,
        ]],
        'flex' => 0,
        'discount' => 200,
    ]);
    $response->assertSessionMissing('error');
    $response->assertRedirect(route('app.orders.index'));

    $order = Order::withoutGlobalScopes()->where('tenant_id', $tenant->id)->firstOrFail();

    expect($order->uses_admin_flex)->toBeTrue()
        ->and((float) $balance->fresh()->value)->toBe(5.0);

    $this->patchJson("/app/cancelorder/{$order->id}")->assertOk();

    expect((float) $balance->fresh()->value)->toBe(5.0)
        ->and($order->fresh()->status)->toBe('4');
});

test('owner order discount is rejected when it exceeds the admin flex universal ceiling', function () {
    $tenant = adminFlexTenant('06');
    $owner = adminFlexOwner($tenant, '06');
    $customer = adminFlexCustomer($tenant, $owner, '06');
    $product = adminFlexProduct($tenant, '06');
    $tenant->update(['admin_flex' => 50]);
    $this->actingAs($owner);
    Flex::create(['value' => 1000]);

    $this->post(route('app.orders.store'), [
        'customer_id' => $customer->id,
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 1,
            'price' => 100,
            'name' => $product->name,
            'total' => 100,
        ]],
        'flex' => 0,
        'discount' => 200,
    ])->assertSessionHas('error');

    expect(Order::withoutGlobalScopes()->where('tenant_id', $tenant->id)->count())->toBe(0);
});
