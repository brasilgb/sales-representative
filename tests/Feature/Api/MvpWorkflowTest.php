<?php

use App\Models\Admin\Plan;
use App\Models\Campaign;
use App\Models\CommercialCondition;
use App\Models\Customer;
use App\Models\Flex;
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

test('android order uses server commercial price without flex for any quantity', function (int $quantity) {
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
        'quantity' => 20,
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
            'quantity' => $quantity,
            'price' => 1,
            'name' => 'Valor enviado pelo cliente não é confiável',
            'total' => 2,
        ]],
        'flex' => 0,
        'discount' => 0,
        'total' => 1,
    ])->assertCreated()
        ->assertJsonPath('order.total', 120 * $quantity)
        ->assertJsonPath('order.flex', 0)
        ->assertJsonPath('order.discount', 0)
        ->assertJsonPath('order.payment_condition', '28 dias')
        ->assertJsonPath('order.commission_amount', 6 * $quantity);

    $order = Order::firstOrFail();
    expect($order->commercial_condition_id)->toBe($condition->id)
        ->and((float) $order->orderItems()->firstOrFail()->price)->toBe(120.0)
        ->and($product->fresh()->quantity)->toBe(20 - $quantity);
})->with([1, 5, 10]);

test('order selected from a campaign uses its price and records the campaign', function () {
    $tenant = mvpTenant('solo', 'campaign-order');
    $owner = mvpUser($tenant, User::ROLE_OWNER, 'campaign-order');
    Sanctum::actingAs($owner);

    $customer = Customer::create([
        'name' => 'Cliente da campanha',
        'cnpj' => '93970859000101',
    ]);
    $product = Product::create([
        'name' => 'Produto da campanha',
        'reference' => 'CAMP-ORDER-001',
        'unity' => 'UN',
        'measure' => 1,
        'price' => 100,
        'quantity' => 10,
        'min_quantity' => 1,
        'enabled' => true,
    ]);
    $campaign = Campaign::create([
        'name' => 'Campanha com desconto',
        'scope_type' => 'product',
        'audience_type' => 'all',
        'status' => true,
    ]);
    $campaign->products()->attach($product);
    $condition = CommercialCondition::create([
        'name' => 'Preço da campanha',
        'scope_type' => 'campaign',
        'campaign_id' => $campaign->id,
        'price_adjustment_percentage' => 0,
        'max_discount_percentage' => 15,
        'minimum_order_amount' => 0,
        'payment_terms' => 'À vista',
        'commission_percentage' => 4,
        'status' => true,
    ]);

    $this->postJson('/api/orders', [
        'customer_id' => $customer->id,
        'campaign_id' => $campaign->id,
        'items' => [['product_id' => $product->id, 'quantity' => 2]],
    ])->assertCreated()
        ->assertJsonPath('order.campaign_id', $campaign->id)
        ->assertJsonPath('order.total', 170)
        ->assertJsonPath('order.payment_condition', 'À vista');

    $order = Order::firstOrFail();
    expect($order->campaign_id)->toBe($campaign->id)
        ->and($order->commercial_condition_id)->toBe($condition->id)
        ->and((float) $order->orderItems()->firstOrFail()->price)->toBe(85.0);

    $condition->update(['minimum_order_quantity' => 3]);

    $this->postJson('/api/orders', [
        'customer_id' => $customer->id,
        'campaign_id' => $campaign->id,
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
    ])->assertStatus(400)
        ->assertJsonPath('message', 'Ocorreu um erro: Quantidade mínima da campanha não atingida.');

    expect(Order::count())->toBe(1);
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

test('team administrator sees data from every seller region in the mobile app', function () {
    $tenant = mvpTenant('equipe', 'admin-visibility');
    $owner = mvpUser($tenant, User::ROLE_OWNER, 'admin-visibility');
    $sellerNorth = mvpUser($tenant, User::ROLE_SELLER, 'seller-north');
    $sellerSouth = mvpUser($tenant, User::ROLE_SELLER, 'seller-south');
    Sanctum::actingAs($owner);

    $north = Region::create(['name' => 'Região Norte', 'status' => true]);
    $south = Region::create(['name' => 'Região Sul', 'status' => true]);
    $sellerNorth->regions()->attach($north);
    $sellerSouth->regions()->attach($south);

    $customerNorth = Customer::create([
        'user_id' => $sellerNorth->id,
        'region_id' => $north->id,
        'name' => 'Cliente Norte',
        'cnpj' => '46066056000111',
        'email' => 'cliente-norte@example.com',
    ]);
    $customerSouth = Customer::create([
        'user_id' => $sellerSouth->id,
        'region_id' => $south->id,
        'name' => 'Cliente Sul',
        'cnpj' => '62462048000130',
        'email' => 'cliente-sul@example.com',
    ]);
    $product = Product::create([
        'name' => 'Produto compartilhado da equipe',
        'reference' => 'TEAM-001',
        'description' => 'Disponível em todas as regiões',
        'unity' => 'UN',
        'measure' => 1,
        'price' => 50,
        'quantity' => 20,
        'min_quantity' => 1,
        'enabled' => true,
    ]);
    $orderNorth = Order::create([
        'user_id' => $sellerNorth->id,
        'customer_id' => $customerNorth->id,
        'order_number' => 101,
        'total' => 50,
        'status' => '1',
    ]);
    $orderSouth = Order::create([
        'user_id' => $sellerSouth->id,
        'customer_id' => $customerSouth->id,
        'order_number' => 102,
        'total' => 50,
        'status' => '1',
    ]);

    $this->getJson('/api/alldata')
        ->assertOk()
        ->assertJsonPath('data.user.0.id', $owner->id)
        ->assertJsonFragment(['id' => $sellerNorth->id, 'name' => $sellerNorth->name])
        ->assertJsonFragment(['id' => $sellerSouth->id, 'name' => $sellerSouth->name])
        ->assertJsonFragment(['id' => $north->id, 'name' => $north->name])
        ->assertJsonFragment(['id' => $south->id, 'name' => $south->name])
        ->assertJsonFragment(['id' => $customerNorth->id, 'name' => $customerNorth->name])
        ->assertJsonFragment(['id' => $customerSouth->id, 'name' => $customerSouth->name])
        ->assertJsonFragment(['id' => $orderNorth->id, 'order_number' => 101])
        ->assertJsonFragment(['id' => $orderSouth->id, 'order_number' => 102])
        ->assertJsonFragment(['id' => $product->id, 'reference' => 'TEAM-001']);

    $this->getJson('/api/customers')->assertOk()->assertJsonCount(2);
    $this->getJson('/api/orders')->assertOk()->assertJsonCount(2);
    $this->getJson('/api/products')->assertOk()->assertJsonCount(1);
});

test('customer email is optional but is validated when provided', function () {
    $tenant = mvpTenant('solo', 'customer-email');
    $owner = mvpUser($tenant, User::ROLE_OWNER, 'customer-email');
    Sanctum::actingAs($owner);

    $region = Region::create(['name' => 'Região principal', 'status' => true]);

    $response = $this->postJson('/api/customers', [
        'name' => 'Cliente sem e-mail',
        'cnpj' => '04252011000110',
        'region_id' => $region->id,
    ])->assertCreated()
        ->assertJsonPath('email', null);

    $customerId = $response->json('id');

    $this->patchJson("/api/customers/{$customerId}", [
        'name' => 'Cliente sem e-mail atualizado',
        'cnpj' => '04252011000110',
        'region_id' => $region->id,
        'email' => null,
    ])->assertOk()
        ->assertJsonPath('email', null);

    $this->postJson('/api/customers', [
        'name' => 'Cliente com e-mail inválido',
        'cnpj' => '11222333000181',
        'region_id' => $region->id,
        'email' => 'email-invalido',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});

test('customer accepts a valid cpf or cnpj and rejects an invalid document', function () {
    $tenant = mvpTenant('solo', 'customer-document');
    $owner = mvpUser($tenant, User::ROLE_OWNER, 'customer-document');
    Sanctum::actingAs($owner);
    $region = Region::create(['name' => 'Região documentos', 'status' => true]);

    $this->postJson('/api/customers', [
        'name' => 'Cliente pessoa física',
        'cnpj' => '529.982.247-25',
        'region_id' => $region->id,
    ])->assertCreated()
        ->assertJsonPath('cnpj', '52998224725');

    $this->postJson('/api/customers', [
        'name' => 'Cliente pessoa jurídica',
        'cnpj' => '04.252.011/0001-10',
        'region_id' => $region->id,
    ])->assertCreated()
        ->assertJsonPath('cnpj', '04252011000110');

    $this->postJson('/api/customers', [
        'name' => 'Cliente documento inválido',
        'cnpj' => '111.111.111-11',
        'region_id' => $region->id,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('cnpj');
});

test('order editing recalculates stock flex totals and rolls back invalid changes', function () {
    $tenant = mvpTenant('solo', 'edit-order');
    $owner = mvpUser($tenant, User::ROLE_OWNER, 'edit-order');
    Sanctum::actingAs($owner);
    Flex::create(['value' => 50]);
    $customer = Customer::create(['name' => 'Cliente edição', 'cnpj' => '52998224725']);
    $product = Product::create([
        'name' => 'Produto edição', 'reference' => 'EDIT-001', 'description' => 'Teste',
        'unity' => 'UN', 'measure' => 1, 'price' => 10, 'quantity' => 10, 'min_quantity' => 1, 'enabled' => true,
    ]);

    $created = $this->postJson('/api/orders', [
        'customer_id' => $customer->id,
        'items' => [['product_id' => $product->id, 'quantity' => 2]],
        'total' => 20,
        'discount' => 0,
    ])->assertCreated();
    $orderId = $created->json('order.id');

    $this->putJson("/api/orders/{$orderId}", [
        'customer_id' => $customer->id,
        'items' => [['product_id' => $product->id, 'quantity' => 3]],
        'adjusted_total' => 36,
        'discount' => 1,
    ])->assertOk()
        ->assertJsonPath('order.subtotal', 30)
        ->assertJsonPath('order.flex', 6)
        ->assertJsonPath('order.discount', 1)
        ->assertJsonPath('order.total', 35);

    expect($product->fresh()->quantity)->toBe(7)
        ->and((float) Flex::firstOrFail()->value)->toBe(55.0);

    $this->putJson("/api/orders/{$orderId}", [
        'customer_id' => $customer->id,
        'items' => [['product_id' => $product->id, 'quantity' => 99]],
        'adjusted_total' => 990,
        'discount' => 0,
    ])->assertStatus(409)
        ->assertJsonPath('message', 'Estoque insuficiente para o produto: Produto edição');

    expect($product->fresh()->quantity)->toBe(7)
        ->and((float) Flex::firstOrFail()->value)->toBe(55.0)
        ->and((float) Order::findOrFail($orderId)->total)->toBe(35.0);
});

test('mobile orders apply and persist an individual product discount', function () {
    $tenant = mvpTenant('solo', 'item-discount');
    $owner = mvpUser($tenant, User::ROLE_OWNER, 'item-discount');
    Sanctum::actingAs($owner);
    Flex::create(['value' => 50]);
    $customer = Customer::create(['name' => 'Cliente desconto', 'cnpj' => '52998224725']);
    $product = Product::create([
        'name' => 'Produto com desconto', 'reference' => 'DESC-001', 'description' => 'Teste',
        'unity' => 'UN', 'measure' => 1, 'price' => 10, 'quantity' => 10, 'min_quantity' => 1, 'enabled' => true,
    ]);

    $created = $this->postJson('/api/orders', [
        'customer_id' => $customer->id,
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 3,
            'discount_percentage' => 10,
        ]],
    ])->assertCreated()
        ->assertJsonPath('order.subtotal', 27)
        ->assertJsonPath('order.total', 27)
        ->assertJsonPath('order.order_items.0.discount_percentage', '10.00')
        ->assertJsonPath('order.order_items.0.discount_amount', '3.00')
        ->assertJsonPath('order.order_items.0.total', '27.00');

    $this->putJson('/api/orders/'.$created->json('order.id'), [
        'customer_id' => $customer->id,
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 2,
            'discount_percentage' => 25,
        ]],
        'adjusted_total' => 15,
        'discount' => 0,
    ])->assertOk()
        ->assertJsonPath('order.subtotal', 15)
        ->assertJsonPath('order.total', 15)
        ->assertJsonPath('order.order_items.0.discount_percentage', '25.00')
        ->assertJsonPath('order.order_items.0.discount_amount', '5.00');

    $this->postJson('/api/orders', [
        'customer_id' => $customer->id,
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 1,
            'discount_percentage' => 101,
        ]],
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('items.0.discount_percentage');

    $this->postJson('/api/orders', [
        'customer_id' => $customer->id,
        'items' => [['product_id' => $product->id, 'quantity' => 1, 'discount_amount' => -2]],
    ])->assertCreated()
        ->assertJsonPath('order.subtotal', 8)
        ->assertJsonPath('order.order_items.0.discount_amount', '-2.00')
        ->assertJsonPath('order.order_items.0.total', '8.00');

    $this->postJson('/api/orders', [
        'customer_id' => $customer->id,
        'items' => [['product_id' => $product->id, 'quantity' => 1, 'discount_amount' => 2]],
    ])->assertCreated()
        ->assertJsonPath('order.subtotal', 12)
        ->assertJsonPath('order.order_items.0.discount_amount', '2.00')
        ->assertJsonPath('order.order_items.0.total', '12.00');
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
        'trial_ends_at' => now()->subDays(4),
        'expiration_date' => now()->subDays(4),
    ]);
    $owner = mvpUser($expiredTenant, User::ROLE_OWNER, 'expired-subscription');

    Sanctum::actingAs($owner);
    $this->getJson('/api/user')
        ->assertStatus(402)
        ->assertJsonPath('message', 'Período de teste expirado. Regularize a assinatura para continuar.');
});
