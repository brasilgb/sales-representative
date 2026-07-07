<?php

use App\Models\Admin\Plan;
use App\Models\CommercialCondition;
use App\Models\Customer;
use App\Models\Flex;
use App\Models\Order;
use App\Models\Product;
use App\Models\Region;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Sanctum\Sanctum;

function isolationTenant(string $suffix): Tenant
{
    return Tenant::create([
        'company' => "Empresa {$suffix}",
        'cnpj' => "0000000000000{$suffix}",
        'email' => "empresa{$suffix}@example.com",
        'status' => 1,
        'payment' => true,
        'expiration_date' => now()->addYear(),
        'plan_type' => Tenant::PLAN_INDIVIDUAL,
    ]);
}

function isolationOwner(Tenant $tenant, string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "Proprietario {$suffix}",
        'email' => "owner{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_OWNER,
        'status' => 1,
    ]);
}

function isolationCustomer(Tenant $tenant, User $owner, string $suffix): Customer
{
    $customer = new Customer([
        'user_id' => $owner->id,
        'name' => "Cliente {$suffix}",
        'cnpj' => "1000000000000{$suffix}",
        'email' => "cliente{$suffix}@example.com",
        'phone' => '11999999999',
    ]);
    $customer->tenant_id = $tenant->id;
    $customer->save();

    return $customer;
}

function isolationProduct(Tenant $tenant, string $suffix, ?string $reference = null): Product
{
    $product = new Product([
        'name' => "Produto {$suffix}",
        'reference' => $reference ?? "REF-{$suffix}",
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

    return $product;
}

function isolationOrder(Tenant $tenant, User $owner, Customer $customer, string $suffix): Order
{
    $order = new Order([
        'user_id' => $owner->id,
        'customer_id' => $customer->id,
        'order_number' => (int) $suffix,
        'total' => 10,
        'status' => '1',
    ]);
    $order->tenant_id = $tenant->id;
    $order->save();

    return $order;
}

function isolationCondition(array $attributes = []): CommercialCondition
{
    return CommercialCondition::create(array_merge([
        'name' => 'Condição de teste',
        'scope_type' => 'global',
        'price_adjustment_percentage' => 0,
        'max_discount_percentage' => 0,
        'minimum_order_amount' => 0,
        'payment_terms' => '28 dias',
        'commission_percentage' => 0,
        'status' => true,
    ], $attributes));
}

test('visit form lists active sellers from the tenant', function () {
    $tenant = isolationTenant('31');
    $owner = isolationOwner($tenant, '31');
    $activeSeller = User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => 'Vendedor ativo',
        'email' => 'seller31@example.com',
        'password' => 'password',
        'roles' => User::ROLE_SELLER,
        'status' => true,
    ]);
    User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => 'Vendedor inativo',
        'email' => 'inactive31@example.com',
        'password' => 'password',
        'roles' => User::ROLE_SELLER,
        'status' => false,
    ]);

    $this->actingAs($owner)
        ->get(route('app.visits.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('app/visits/create-visit')
            ->has('users', 2)
            ->where('users.0.id', $owner->id)
            ->where('users.1.id', $activeSeller->id));
});

test('tenant cannot read records from another tenant in web routes', function () {
    $tenantA = isolationTenant('1');
    $tenantB = isolationTenant('2');
    $ownerA = isolationOwner($tenantA, '1');
    $ownerB = isolationOwner($tenantB, '2');
    $customerB = isolationCustomer($tenantB, $ownerB, '2');
    $productB = isolationProduct($tenantB, '2');
    $orderB = isolationOrder($tenantB, $ownerB, $customerB, '2');

    $this->actingAs($ownerA)
        ->get(route('app.customers.show', $customerB))
        ->assertNotFound();

    $this->get(route('app.products.show', $productB))->assertNotFound();
    $this->get(route('app.orders.show', $orderB))->assertNotFound();
});

test('tenant cannot change or delete records from another tenant', function () {
    $tenantA = isolationTenant('3');
    $tenantB = isolationTenant('4');
    $ownerA = isolationOwner($tenantA, '3');
    $ownerB = isolationOwner($tenantB, '4');
    $customerB = isolationCustomer($tenantB, $ownerB, '4');
    $productB = isolationProduct($tenantB, '4');
    $orderB = isolationOrder($tenantB, $ownerB, $customerB, '4');

    $this->actingAs($ownerA)
        ->delete(route('app.products.destroy', $productB))
        ->assertNotFound();

    $this->patchJson("/app/statusorder/{$orderB->id}", ['status' => '2'])
        ->assertNotFound();

    expect(Product::withoutGlobalScopes()->find($productB->id))->not->toBeNull()
        ->and(Order::withoutGlobalScopes()->find($orderB->id)?->status)->toBe('1');
});

test('order rejects customer and product ids from another tenant', function () {
    $tenantA = isolationTenant('5');
    $tenantB = isolationTenant('6');
    $ownerA = isolationOwner($tenantA, '5');
    $ownerB = isolationOwner($tenantB, '6');
    $customerB = isolationCustomer($tenantB, $ownerB, '6');
    $productB = isolationProduct($tenantB, '6');

    $this->actingAs($ownerA)
        ->post(route('app.orders.store'), [
            'customer_id' => $customerB->id,
            'items' => [[
                'product_id' => $productB->id,
                'quantity' => 1,
                'price' => 10,
                'name' => $productB->name,
                'total' => 10,
            ]],
        ])
        ->assertSessionHasErrors(['customer_id', 'items.0.product_id']);

    expect(Order::withoutGlobalScopes()->count())->toBe(0);
});

test('product references are unique per tenant instead of globally', function () {
    $tenantA = isolationTenant('7');
    $tenantB = isolationTenant('8');
    $ownerA = isolationOwner($tenantA, '7');
    isolationProduct($tenantB, '8', 'SHARED-REF');

    $this->actingAs($ownerA)
        ->post(route('app.products.store'), [
            'name' => 'Produto do tenant A',
            'reference' => 'SHARED-REF',
            'description' => 'Produto de teste',
            'unity' => 'UN',
            'measure' => 1,
            'price' => 10,
            'quantity' => 5,
            'min_quantity' => 1,
            'enabled' => true,
        ])
        ->assertSessionHasNoErrors();

    expect(Product::withoutGlobalScopes()->where('reference', 'SHARED-REF')->count())->toBe(2);
});

test('product reference lookup api requires authentication and respects tenant', function () {
    $tenantA = isolationTenant('9');
    $tenantB = isolationTenant('10');
    $ownerA = isolationOwner($tenantA, '9');
    $productB = isolationProduct($tenantB, '10', 'PRIVATE-REF');

    $this->getJson("/api/getproducts/{$productB->reference}")->assertUnauthorized();

    Sanctum::actingAs($ownerA);

    $this->getJson("/api/getproducts/{$productB->reference}")
        ->assertOk()
        ->assertJsonPath('product', null);

    $this->getJson("/api/products/{$productB->id}")->assertNotFound();
});

test('flex balance applies order movements and is restored on cancellation', function () {
    $tenant = isolationTenant('18');
    $owner = isolationOwner($tenant, '18');
    $customer = isolationCustomer($tenant, $owner, '18');
    $product = isolationProduct($tenant, '18');

    $this->actingAs($owner);
    $balance = Flex::create(['value' => 10]);

    $this->post(route('app.orders.store'), [
        'customer_id' => $customer->id,
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 1,
            'price' => 10,
            'name' => $product->name,
            'total' => 10,
        ]],
        'flex' => 2,
        'discount' => 5,
    ])->assertRedirect(route('app.orders.index'));

    $order = Order::withoutGlobalScopes()->where('tenant_id', $tenant->id)->firstOrFail();

    expect((float) $balance->fresh()->value)->toBe(7.0);

    $this->patchJson("/app/cancelorder/{$order->id}")
        ->assertOk();

    expect((float) $balance->fresh()->value)->toBe(10.0)
        ->and($order->fresh()->status)->toBe('4');
});

test('web order with automatic total does not consume flex for quantities above five', function () {
    $tenant = isolationTenant('32');
    $owner = isolationOwner($tenant, '32');
    $customer = isolationCustomer($tenant, $owner, '32');
    $product = isolationProduct($tenant, '32');

    $this->actingAs($owner);
    Flex::create(['value' => 0]);

    $this->post(route('app.orders.store'), [
        'customer_id' => $customer->id,
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 6,
            'price' => 10,
            'name' => $product->name,
            'total' => 60,
        ]],
        // Simula um valor automático antigo/desatualizado enviado pela tela.
        'adjusted_total' => 10,
        'discount' => 0,
    ])->assertRedirect(route('app.orders.index'));

    $order = Order::withoutGlobalScopes()->where('tenant_id', $tenant->id)->firstOrFail();

    expect((float) $order->subtotal)->toBe(60.0)
        ->and((float) $order->total)->toBe(60.0)
        ->and((float) $order->discount)->toBe(0.0)
        ->and((float) $order->flex)->toBe(0.0)
        ->and((float) Flex::firstOrFail()->value)->toBe(0.0);
});

test('order cannot consume more flex than the available balance', function () {
    $tenant = isolationTenant('19');
    $owner = isolationOwner($tenant, '19');
    $customer = isolationCustomer($tenant, $owner, '19');
    $product = isolationProduct($tenant, '19');

    $this->actingAs($owner);
    $balance = Flex::create(['value' => 10]);

    $this->from(route('app.orders.create'))->post(route('app.orders.store'), [
        'customer_id' => $customer->id,
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 1,
            'price' => 10,
            'name' => $product->name,
            'total' => 10,
        ]],
        'discount' => 11,
    ])->assertRedirect(route('app.orders.create'))
        ->assertSessionHas('error');

    expect((float) $balance->fresh()->value)->toBe(10.0)
        ->and(Order::withoutGlobalScopes()->where('tenant_id', $tenant->id)->count())->toBe(0);
});

test('order applies price discount payment terms and commission from commercial condition', function () {
    $tenant = isolationTenant('20');
    $owner = isolationOwner($tenant, '20');
    $this->actingAs($owner);
    $customer = isolationCustomer($tenant, $owner, '20');
    $product = isolationProduct($tenant, '20');
    $product->update(['price' => 100, 'quantity' => 10]);
    $condition = isolationCondition([
        'name' => 'Condição global 10%',
        'price_adjustment_percentage' => 10,
        'max_discount_percentage' => 10,
        'minimum_order_amount' => 200,
        'commission_percentage' => 5,
    ]);
    $balance = Flex::create(['value' => 20]);

    $this->post(route('app.orders.store'), [
        'customer_id' => $customer->id,
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 2,
            'price' => 110,
            'name' => $product->name,
            'total' => 1,
        ]],
        'discount' => 20,
    ])->assertRedirect(route('app.orders.index'));

    $order = Order::withoutGlobalScopes()->where('tenant_id', $tenant->id)->firstOrFail();

    expect($order->commercial_condition_id)->toBe($condition->id)
        ->and((float) $order->total)->toBe(200.0)
        ->and($order->payment_condition)->toBe('28 dias')
        ->and((float) $order->commission_percentage)->toBe(5.0)
        ->and((float) $order->commission_amount)->toBe(10.0)
        ->and((float) $order->orderItems()->firstOrFail()->total)->toBe(220.0)
        ->and((float) $balance->fresh()->value)->toBe(0.0)
        ->and($product->fresh()->quantity)->toBe(8);
});

test('order rejects divergent price excessive discount and minimum order violation', function () {
    $tenant = isolationTenant('21');
    $owner = isolationOwner($tenant, '21');
    $this->actingAs($owner);
    $customer = isolationCustomer($tenant, $owner, '21');
    $product = isolationProduct($tenant, '21');
    $product->update(['price' => 100, 'quantity' => 10]);
    $condition = isolationCondition([
        'price_adjustment_percentage' => 10,
        'max_discount_percentage' => 10,
        'minimum_order_amount' => 200,
    ]);
    $balance = Flex::create(['value' => 100]);
    $payload = [
        'customer_id' => $customer->id,
        'items' => [[
            'product_id' => $product->id,
            'quantity' => 2,
            'price' => 110,
            'name' => $product->name,
            'total' => 220,
        ]],
    ];

    $divergentPrice = $payload;
    $divergentPrice['items'][0]['price'] = 100;
    $this->from(route('app.orders.create'))->post(route('app.orders.store'), $divergentPrice)
        ->assertRedirect(route('app.orders.create'))
        ->assertSessionHas('error', fn (string $message) => str_contains($message, 'Preço divergente'));

    $this->from(route('app.orders.create'))->post(route('app.orders.store'), [...$payload, 'discount' => 23])
        ->assertRedirect(route('app.orders.create'))
        ->assertSessionHas('error', fn (string $message) => str_contains($message, 'Desconto acima'));

    $condition->update(['max_discount_percentage' => 100, 'minimum_order_amount' => 210]);
    $this->from(route('app.orders.create'))->post(route('app.orders.store'), [...$payload, 'discount' => 20])
        ->assertRedirect(route('app.orders.create'))
        ->assertSessionHas('error', fn (string $message) => str_contains($message, 'Pedido abaixo'));

    expect(Order::withoutGlobalScopes()->where('tenant_id', $tenant->id)->count())->toBe(0)
        ->and((float) $balance->fresh()->value)->toBe(100.0)
        ->and($product->fresh()->quantity)->toBe(10);
});

test('commercial condition uses customer region type and global priority', function () {
    $tenant = isolationTenant('22');
    $owner = isolationOwner($tenant, '22');
    $this->actingAs($owner);
    $region = Region::create(['name' => 'Capital', 'status' => true]);
    $customer = new Customer([
        'user_id' => $owner->id,
        'region_id' => $region->id,
        'establishment_type' => 'petshop',
        'name' => 'Petshop prioridade',
    ]);
    $customer->tenant_id = $tenant->id;
    $customer->save();

    $global = isolationCondition(['name' => 'Global']);
    $establishment = isolationCondition([
        'name' => 'Tipo',
        'scope_type' => 'establishment_type',
        'establishment_type' => 'petshop',
    ]);
    $regional = isolationCondition([
        'name' => 'Regional',
        'scope_type' => 'region',
        'region_id' => $region->id,
    ]);
    $specific = isolationCondition([
        'name' => 'Cliente',
        'scope_type' => 'customer',
        'customer_id' => $customer->id,
    ]);

    expect(CommercialCondition::resolveForCustomer($customer)?->id)->toBe($specific->id);

    $specific->update(['status' => false]);
    expect(CommercialCondition::resolveForCustomer($customer)?->id)->toBe($regional->id);

    $regional->update(['status' => false]);
    expect(CommercialCondition::resolveForCustomer($customer)?->id)->toBe($establishment->id);

    $establishment->update(['status' => false]);
    expect(CommercialCondition::resolveForCustomer($customer)?->id)->toBe($global->id);
});

test('solo plan cannot add sellers and does not expose team actions', function () {
    $plan = Plan::where('slug', 'solo')->firstOrFail();
    $tenant = isolationTenant('11');
    $tenant->update(['plan' => $plan->id, 'plan_type' => Tenant::PLAN_INDIVIDUAL]);
    $owner = isolationOwner($tenant, '11');

    expect($owner->canManageSellers())->toBeFalse();

    $this->actingAs($owner)
        ->get(route('app.users.index'))
        ->assertRedirect(route('app.users.edit', $owner));

    $this->get(route('app.users.edit', $owner))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('app/users/edit-user')
            ->where('canManageSellers', false));

    $this->post(route('app.users.store'), [
        'name' => 'Vendedor bloqueado',
        'email' => 'blocked-seller@example.com',
        'roles' => User::ROLE_SELLER,
        'status' => true,
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertForbidden();

    expect(User::withoutGlobalScopes()->where('tenant_id', $tenant->id)->count())->toBe(1);
});

test('team plan administrators can add sellers within the plan limit', function () {
    $plan = Plan::where('slug', 'equipe')->firstOrFail();
    $tenant = isolationTenant('12');
    $tenant->update(['plan' => $plan->id, 'plan_type' => Tenant::PLAN_TEAM]);
    $owner = isolationOwner($tenant, '12');

    expect($owner->canManageSellers())->toBeTrue();

    $this->actingAs($owner)
        ->get(route('app.users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('app/users/index')
            ->has('users.data', 1));

    $this->get(route('app.users.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('app/users/create-user'));

    $this->post(route('app.users.store'), [
        'name' => 'Novo vendedor',
        'email' => 'team-seller@example.com',
        'whatsapp' => '11999999999',
        'roles' => User::ROLE_SELLER,
        'status' => true,
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ])->assertRedirect();

    expect(User::withoutGlobalScopes()->where('tenant_id', $tenant->id)->count())->toBe(2);

    $seller = User::withoutGlobalScopes()->where('email', 'team-seller@example.com')->firstOrFail();
    $this->get(route('app.users.edit', $seller))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('app/users/edit-user')
            ->where('user.id', $seller->id)
            ->where('canManageSellers', true));

    $this->delete(route('app.users.destroy', $seller))
        ->assertRedirect(route('app.users.index'));

    expect(User::withoutGlobalScopes()->where('tenant_id', $tenant->id)->count())->toBe(1);
});

test('company settings update only the authenticated tenant', function () {
    $tenantA = isolationTenant('13');
    $tenantB = isolationTenant('14');
    $ownerA = isolationOwner($tenantA, '13');

    $this->actingAs($ownerA)
        ->get(route('app.company.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('app/company/index')
            ->where('company.id', $tenantA->id)
            ->where('canEdit', true));

    $this->patch(route('app.company.update'), [
        'company' => 'Empresa atualizada',
        'cnpj' => '04.252.011/0001-10',
        'email' => 'empresa-atualizada@example.com',
        'phone' => '1133334444',
        'whatsapp' => '11999999999',
        'city' => 'São Paulo',
        'state' => 'SP',
    ])->assertRedirect(route('app.company.index'));

    expect($tenantA->fresh()->company)->toBe('Empresa atualizada')
        ->and($tenantB->fresh()->company)->toBe('Empresa 14');
});

test('company owner can upload a logo', function () {
    Storage::fake('public');

    $tenant = isolationTenant('16');
    $owner = isolationOwner($tenant, '16');

    $this->actingAs($owner)
        ->patch(route('app.company.update'), [
            'company' => $tenant->company,
            'logo' => UploadedFile::fake()->image('logo.png'),
            'cnpj' => '04.252.011/0001-10',
            'email' => $tenant->email,
            'phone' => '1133334444',
            'whatsapp' => '11999999999',
        ])
        ->assertRedirect(route('app.company.index'));

    $logo = $tenant->fresh()->logo;

    expect($logo)->not->toBeNull();
    Storage::disk('public')->assertExists($logo);
});

test('individual account owner can update their profile photo', function () {
    Storage::fake('public');

    $plan = Plan::where('slug', 'solo')->firstOrFail();
    $tenant = isolationTenant('17');
    $tenant->update(['plan' => $plan->id, 'plan_type' => Tenant::PLAN_INDIVIDUAL]);
    $owner = isolationOwner($tenant, '17');

    $this->actingAs($owner)
        ->patch(route('app.users.update', $owner), [
            'name' => 'Usuário individual atualizado',
            'avatar' => UploadedFile::fake()->image('usuario.jpg'),
            'email' => $owner->email,
            'whatsapp' => '11999999999',
        ])
        ->assertRedirect(route('app.users.edit', $owner));

    $owner->refresh();

    expect($owner->name)->toBe('Usuário individual atualizado')
        ->and($owner->getRawOriginal('avatar'))->not->toBeNull();
    Storage::disk('public')->assertExists($owner->getRawOriginal('avatar'));
});

test('other settings exposes license data and appearance page', function () {
    $tenant = isolationTenant('15');
    $owner = isolationOwner($tenant, '15');

    $this->actingAs($owner)
        ->get(route('app.other-settings.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('app/other-settings/index')
            ->where('tenant.id', $tenant->id)
            ->where('onTrial', false)
            ->where('blockedReason', null));
});
