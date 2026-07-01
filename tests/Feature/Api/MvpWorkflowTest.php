<?php

use App\Models\Admin\Plan;
use App\Models\CommercialCondition;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Region;
use App\Models\Tenant;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function mvpTenant(string $slug, string $suffix): Tenant
{
    $plan = Plan::where('slug', $slug)->firstOrFail();

    return Tenant::create([
        'plan' => $plan->id,
        'plan_type' => $plan->account_type,
        'company' => "MVP {$suffix}",
        'cnpj' => "3000000000000{$suffix}",
        'email' => "mvp-{$suffix}@example.com",
        'status' => 1,
        'payment' => true,
        'expiration_date' => now()->addYear(),
    ]);
}

function mvpUser(Tenant $tenant, int $role, string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "MVP {$suffix}",
        'email' => "mvp-user-{$suffix}@example.com",
        'password' => 'password',
        'roles' => $role,
        'status' => 1,
    ]);
}

test('android order uses server commercial price and calculates commission', function () {
    $tenant = mvpTenant('solo', 'order');
    $owner = mvpUser($tenant, User::ROLE_OWNER, 'order');
    Sanctum::actingAs($owner);

    $customer = Customer::create([
        'name' => 'Pet Shop MVP',
        'cnpj' => '04252011000110',
        'email' => 'pet-mvp@example.com',
    ]);
    $product = Product::create([
        'name' => 'Ração MVP',
        'reference' => 'MVP-001',
        'description' => 'Ração teste',
        'unity' => 'UN',
        'measure' => 1,
        'price' => 100,
        'quantity' => 10,
        'min_quantity' => 1,
        'enabled' => true,
    ]);
    $condition = CommercialCondition::create([
        'name' => 'Tabela MVP',
        'scope_type' => 'customer',
        'customer_id' => $customer->id,
        'price_adjustment_percentage' => 20,
        'max_discount_percentage' => 10,
        'minimum_order_amount' => 50,
        'payment_terms' => '28 dias',
        'commission_percentage' => 5,
        'status' => true,
    ]);

    $this->postJson('/api/orders', [
        'customer_id' => $customer->id,
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 2,
            'price' => 1,
            'name' => 'Valor enviado pelo cliente não é confiável',
            'total' => 2,
        ]],
        'flex' => 0,
        'discount' => 0,
    ])->assertCreated()
        ->assertJsonPath('order.total', 240)
        ->assertJsonPath('order.payment_condition', '28 dias')
        ->assertJsonPath('order.commission_amount', 12);

    $order = Order::firstOrFail();
    expect($order->commercial_condition_id)->toBe($condition->id)
        ->and((float) $order->orderItems()->firstOrFail()->price)->toBe(120.0)
        ->and($product->fresh()->quantity)->toBe(8);
});

test('seller can use the mobile visit agenda for their assigned region', function () {
    $tenant = mvpTenant('equipe', 'visits');
    $seller = mvpUser($tenant, User::ROLE_SELLER, 'visits');
    Sanctum::actingAs($seller);

    $region = Region::create(['name' => 'Zona Norte', 'status' => true]);
    $seller->regions()->attach($region);
    $customer = Customer::create([
        'user_id' => $seller->id,
        'region_id' => $region->id,
        'name' => 'Clínica MVP',
        'cnpj' => '11222333000181',
        'email' => 'clinica-mvp@example.com',
    ]);

    $response = $this->postJson('/api/visits', [
        'customer_id' => $customer->id,
        'scheduled_at' => now()->startOfDay()->addHours(12)->toIso8601String(),
        'notes' => 'Apresentar catálogo de rações.',
    ])->assertCreated()
        ->assertJsonPath('status', 'scheduled')
        ->assertJsonPath('user_id', $seller->id);

    $visitId = $response->json('id');

    $this->getJson('/api/visits?date='.now()->toDateString())
        ->assertOk()
        ->assertJsonCount(1);
    $this->patchJson("/api/visits/{$visitId}/check-in", [])->assertOk()->assertJsonPath('status', 'checked_in');
    $this->patchJson("/api/visits/{$visitId}/check-out", ['result' => 'sold'])->assertOk()
        ->assertJsonPath('status', 'completed')
        ->assertJsonPath('result', 'sold');
});

test('mobile api blocks inactive users and tenants without an active subscription', function () {
    $activeTenant = mvpTenant('equipe', 'inactive-user');
    $inactiveSeller = mvpUser($activeTenant, User::ROLE_SELLER, 'inactive-user');
    $inactiveSeller->update(['status' => 0]);

    $this->postJson('/api/login', [
        'email' => $inactiveSeller->email,
        'password' => 'password',
        'device_name' => 'MVP test',
    ])->assertUnprocessable()
        ->assertJsonPath('errors.email.0', 'Usuário inativo. Procure o administrador da equipe.');

    $expiredTenant = mvpTenant('solo', 'expired-subscription');
    $expiredTenant->update([
        'payment' => false,
        'trial_ends_at' => now()->subDay(),
        'expiration_date' => now()->subDay(),
    ]);
    $owner = mvpUser($expiredTenant, User::ROLE_OWNER, 'expired-subscription');

    Sanctum::actingAs($owner);
    $this->getJson('/api/user')
        ->assertStatus(402)
        ->assertJsonPath('message', 'Período de teste expirado. Regularize a assinatura para continuar.');
});
