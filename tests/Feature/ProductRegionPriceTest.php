<?php

use App\Models\Campaign;
use App\Models\CommercialCondition;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductRegionPrice;
use App\Models\Region;
use App\Models\Tenant;
use App\Models\User;
use App\Services\Pricing\RegionalPriceResolver;

function prpTenant(string $suffix): Tenant
{
    return Tenant::create([
        'company' => "Empresa Preço Regional {$suffix}",
        'cnpj' => "0000000002{$suffix}",
        'email' => "empresa-preco-regional-{$suffix}@example.com",
        'status' => true,
        'payment' => true,
        'expiration_date' => now()->addYear(),
        'plan_type' => Tenant::PLAN_TEAM,
    ]);
}

function prpOwner(Tenant $tenant, string $suffix): User
{
    return User::withoutGlobalScopes()->create([
        'tenant_id' => $tenant->id,
        'name' => "Owner Preço Regional {$suffix}",
        'email' => "owner-preco-regional-{$suffix}@example.com",
        'password' => 'password',
        'roles' => User::ROLE_OWNER,
        'status' => true,
    ]);
}

function prpRegion(Tenant $tenant, string $name): Region
{
    $region = new Region(['name' => $name, 'status' => true]);
    $region->tenant_id = $tenant->id;
    $region->save();

    return $region;
}

function prpProduct(Tenant $tenant, string $suffix, float $price = 100.0): Product
{
    $product = new Product([
        'name' => "Produto Preço Regional {$suffix}",
        'reference' => "REF-PRECO-REGIONAL-{$suffix}",
        'description' => 'Produto de teste',
        'unity' => 'UN',
        'measure' => 1,
        'price' => $price,
        'quantity' => 100,
        'min_quantity' => 1,
        'enabled' => true,
    ]);
    $product->tenant_id = $tenant->id;
    $product->save();

    return $product;
}

function prpCustomer(Tenant $tenant, ?Region $region, string $suffix): Customer
{
    $customer = new Customer([
        'name' => "Cliente Preço Regional {$suffix}",
        'region_id' => $region?->id,
    ]);
    $customer->tenant_id = $tenant->id;
    $customer->save();

    return $customer;
}

function prpRegionCondition(Tenant $tenant, Region $region, float $percentage, bool $status = true): CommercialCondition
{
    $condition = new CommercialCondition([
        'name' => "Ajuste {$region->name}",
        'scope_type' => 'region',
        'region_id' => $region->id,
        'price_adjustment_percentage' => $percentage,
        'max_discount_percentage' => 0,
        'minimum_order_amount' => 0,
        'minimum_order_quantity' => 0,
        'commission_percentage' => 0,
        'status' => $status,
    ]);
    $condition->tenant_id = $tenant->id;
    $condition->save();

    return $condition;
}

function prpSpecialPrice(Tenant $tenant, Product $product, Region $region, float $price, array $overrides = []): ProductRegionPrice
{
    $record = new ProductRegionPrice(array_merge([
        'product_id' => $product->id,
        'region_id' => $region->id,
        'special_price' => $price,
        'is_active' => true,
    ], $overrides));
    $record->tenant_id = $tenant->id;
    $record->save();

    return $record;
}

function prpCampaign(Tenant $tenant, Product $product, float $discountPercentage): Campaign
{
    $campaign = new Campaign([
        'name' => 'Campanha Diag',
        'scope_type' => 'product',
        'audience_type' => 'all',
        'status' => true,
    ]);
    $campaign->tenant_id = $tenant->id;
    $campaign->save();
    $campaign->products()->attach($product->id);

    $condition = new CommercialCondition([
        'name' => 'Condição da campanha',
        'scope_type' => 'campaign',
        'campaign_id' => $campaign->id,
        'price_adjustment_percentage' => 0,
        'max_discount_percentage' => $discountPercentage,
        'minimum_order_amount' => 0,
        'minimum_order_quantity' => 0,
        'commission_percentage' => 0,
        'status' => true,
    ]);
    $condition->tenant_id = $tenant->id;
    $condition->save();

    return $campaign->fresh();
}

// Caso 1: produto sem região => preço efetivo = preço base.
test('product without a region uses the base price', function () {
    $tenant = prpTenant('01');
    $product = prpProduct($tenant, '01', 100);
    $resolver = new RegionalPriceResolver;

    expect($resolver->effectivePriceForSale($product, null, null))->toBe(100.0);
});

// Caso 2: região com +5% e sem preço especial => 100 -> 105.
test('region percentage is applied when there is no special price', function () {
    $tenant = prpTenant('02');
    $region = prpRegion($tenant, 'Fronteira 02');
    $product = prpProduct($tenant, '02', 100);
    $condition = prpRegionCondition($tenant, $region, 5);
    $resolver = new RegionalPriceResolver;

    $resolved = $resolver->resolve($product, $region);
    expect($resolved['regionPercentage'])->toBe(5.0)
        ->and($resolved['calculatedRegionalPrice'])->toBe(105.0)
        ->and($resolved['effectivePrice'])->toBe(105.0)
        ->and($resolved['source'])->toBe('regional_percentage');

    expect($resolver->effectivePriceForSale($product, $region, $condition))->toBe(105.0);
});

// Caso 3: região +5% e preço especial 102.90 => o especial vence e não sofre o percentual.
test('an active special price overrides the regional percentage entirely', function () {
    $tenant = prpTenant('03');
    $region = prpRegion($tenant, 'Fronteira 03');
    $product = prpProduct($tenant, '03', 100);
    $condition = prpRegionCondition($tenant, $region, 5);
    prpSpecialPrice($tenant, $product, $region, 102.90);
    $resolver = new RegionalPriceResolver;

    $resolved = $resolver->resolve($product, $region);
    expect($resolved['calculatedRegionalPrice'])->toBe(105.0)
        ->and($resolved['specialPrice'])->toBe(102.9)
        ->and($resolved['effectivePrice'])->toBe(102.9)
        ->and($resolved['source'])->toBe('special_region_price');

    expect($resolver->effectivePriceForSale($product, $region, $condition))->toBe(102.9);

    // O especial também vence uma condição comercial negociada (cliente/global/tipo de
    // estabelecimento), pois vale apenas para a região a que pertence — não é limitado
    // apenas ao caso de o vencedor ser a condição de região.
    $customerCondition = new CommercialCondition([
        'name' => 'Negociação cliente',
        'scope_type' => 'global',
        'price_adjustment_percentage' => 20,
        'max_discount_percentage' => 0,
        'minimum_order_amount' => 0,
        'minimum_order_quantity' => 0,
        'commission_percentage' => 0,
        'status' => true,
    ]);
    $customerCondition->tenant_id = $tenant->id;
    $customerCondition->save();

    expect($resolver->effectivePriceForSale($product, $region, $customerCondition))->toBe(102.9);
});

// Caso 4: mesmo produto em duas regiões — cada uma resolve de forma independente.
test('the same product resolves independently per region', function () {
    $tenant = prpTenant('04');
    $fronteira = prpRegion($tenant, 'Fronteira 04');
    $serra = prpRegion($tenant, 'Serra 04');
    $product = prpProduct($tenant, '04', 100);

    prpRegionCondition($tenant, $fronteira, 5);
    prpSpecialPrice($tenant, $product, $fronteira, 102.90);
    prpRegionCondition($tenant, $serra, 3);

    $resolver = new RegionalPriceResolver;

    expect($resolver->resolve($product, $fronteira)['effectivePrice'])->toBe(102.9)
        ->and($resolver->resolve($product, $serra)['effectivePrice'])->toBe(103.0)
        ->and($resolver->resolve($product, $serra)['source'])->toBe('regional_percentage');
});

// Caso 5: preço especial desativado => volta ao percentual regional.
test('a deactivated special price falls back to the regional percentage', function () {
    $tenant = prpTenant('05');
    $region = prpRegion($tenant, 'Fronteira 05');
    $product = prpProduct($tenant, '05', 100);
    prpRegionCondition($tenant, $region, 5);
    prpSpecialPrice($tenant, $product, $region, 102.90, ['is_active' => false]);

    $resolved = (new RegionalPriceResolver)->resolve($product, $region);
    expect($resolved['effectivePrice'])->toBe(105.0)
        ->and($resolved['source'])->toBe('regional_percentage');
});

// Caso 6: preço especial expirado => volta ao percentual regional.
test('an expired special price falls back to the regional percentage', function () {
    $tenant = prpTenant('06');
    $region = prpRegion($tenant, 'Fronteira 06');
    $product = prpProduct($tenant, '06', 100);
    prpRegionCondition($tenant, $region, 5);
    prpSpecialPrice($tenant, $product, $region, 102.90, [
        'valid_from' => now()->subDays(10),
        'valid_until' => now()->subDay(),
    ]);

    $resolved = (new RegionalPriceResolver)->resolve($product, $region);
    expect($resolved['effectivePrice'])->toBe(105.0)
        ->and($resolved['source'])->toBe('regional_percentage');

    // Uma validade futura ainda não iniciada também deve ser ignorada.
    $product2 = prpProduct($tenant, '06b', 100);
    prpSpecialPrice($tenant, $product2, $region, 102.90, ['valid_from' => now()->addDays(5)]);
    expect((new RegionalPriceResolver)->resolve($product2, $region)['source'])->toBe('regional_percentage');
});

// Caso 7: região sem percentual cadastrado => usa o preço base.
test('a region without a percentage adjustment uses the base price', function () {
    $tenant = prpTenant('07');
    $region = prpRegion($tenant, 'Sem Ajuste 07');
    $product = prpProduct($tenant, '07', 80);

    $resolved = (new RegionalPriceResolver)->resolve($product, $region);
    expect($resolved['regionPercentage'])->toBeNull()
        ->and($resolved['effectivePrice'])->toBe(80.0)
        ->and($resolved['source'])->toBe('base');
});

// Caso 8: arredondamento monetário determinístico.
test('monetary rounding is deterministic', function () {
    $tenant = prpTenant('08');
    $region = prpRegion($tenant, 'Arredondamento 08');
    $product = prpProduct($tenant, '08', 79.99);
    prpRegionCondition($tenant, $region, 5);

    // 79.99 * 1.05 = 83.9895 -> arredonda para 83.99 (2 casas decimais).
    $resolved = (new RegionalPriceResolver)->resolve($product, $region);
    expect($resolved['calculatedRegionalPrice'])->toBe(83.99);
});

// Caso 9: impedir preço especial negativo.
test('a negative special price is rejected', function () {
    $tenant = prpTenant('09');
    $owner = prpOwner($tenant, '09');
    $region = prpRegion($tenant, 'Fronteira 09');
    $product = prpProduct($tenant, '09', 100);

    $this->actingAs($owner)
        ->post(route('app.products.region-prices.store', $product), [
            'region_id' => $region->id,
            'special_price' => -10,
            'is_active' => true,
        ])
        ->assertSessionHasErrors('special_price');

    expect(ProductRegionPrice::count())->toBe(0);
});

// Caso 10: impedir vínculo com região de outro tenant.
test('a region price cannot be linked to a region from another tenant', function () {
    $tenantA = prpTenant('10a');
    $ownerA = prpOwner($tenantA, '10a');
    $tenantB = prpTenant('10b');
    $regionB = prpRegion($tenantB, 'Região de outro tenant 10');
    $productA = prpProduct($tenantA, '10a', 100);

    $this->actingAs($ownerA)
        ->post(route('app.products.region-prices.store', $productA), [
            'region_id' => $regionB->id,
            'special_price' => 90,
            'is_active' => true,
        ])
        ->assertSessionHasErrors('region_id');

    expect(ProductRegionPrice::count())->toBe(0);

    // Também não deve ser possível acessar/alterar o produto de outro tenant via a rota
    // (o binding de {product} já é isolado pelo TenantScope do model).
    $this->actingAs($ownerA)
        ->patch(route('app.products.region-prices.update', [$productA->id + 999999, 1]), [
            'region_id' => $regionB->id,
            'special_price' => 90,
        ])
        ->assertNotFound();
});

// Fluxo completo: criação de pedido usa o preço especial só para o produto/região certos,
// preservando o percentual normal para os demais — e o snapshot do pedido não é afetado por
// mudanças posteriores na configuração (seção 11 do escopo).
test('order creation applies the special price only for its product and region, keeping the price snapshot afterwards', function () {
    $tenant = prpTenant('acc');
    $owner = prpOwner($tenant, 'acc');
    $fronteira = prpRegion($tenant, 'Fronteira ACC');
    $serra = prpRegion($tenant, 'Serra ACC');
    prpRegionCondition($tenant, $fronteira, 5);
    prpRegionCondition($tenant, $serra, 5);

    $productA = prpProduct($tenant, 'ACC-A', 100); // tem preço especial na Fronteira
    $productB = prpProduct($tenant, 'ACC-B', 50);  // sem preço especial
    prpSpecialPrice($tenant, $productA, $fronteira, 103.50);

    $customerFronteira = prpCustomer($tenant, $fronteira, 'ACC-1');
    $customerSerra = prpCustomer($tenant, $serra, 'ACC-2');

    $this->actingAs($owner)->post(route('app.orders.store'), [
        'customer_id' => $customerFronteira->id,
        'items' => [
            ['product_id' => $productA->id, 'quantity' => 1, 'price' => 103.50, 'name' => $productA->name, 'total' => 103.50],
            ['product_id' => $productB->id, 'quantity' => 1, 'price' => 52.50, 'name' => $productB->name, 'total' => 52.50],
        ],
    ])->assertSessionDoesntHaveErrors()->assertRedirect(route('app.orders.index'));

    $order = Order::where('customer_id', $customerFronteira->id)->firstOrFail();
    expect((float) $order->orderItems()->where('product_id', $productA->id)->first()->price)->toBe(103.5)
        ->and((float) $order->orderItems()->where('product_id', $productB->id)->first()->price)->toBe(52.5);

    // Produto A na região Serra (sem preço especial) segue o percentual normal da região.
    $this->actingAs($owner)->post(route('app.orders.store'), [
        'customer_id' => $customerSerra->id,
        'items' => [
            ['product_id' => $productA->id, 'quantity' => 1, 'price' => 105, 'name' => $productA->name, 'total' => 105],
        ],
    ])->assertSessionDoesntHaveErrors()->assertRedirect(route('app.orders.index'));

    $orderSerra = Order::where('customer_id', $customerSerra->id)->firstOrFail();
    expect((float) $orderSerra->orderItems()->first()->price)->toBe(105.0);

    // Alterar/remover o preço especial depois não deve afetar o pedido já criado (snapshot).
    ProductRegionPrice::where('product_id', $productA->id)->where('region_id', $fronteira->id)->delete();
    expect((float) $order->fresh()->orderItems()->where('product_id', $productA->id)->first()->price)->toBe(103.5);
});

// O preço especial substitui TODAS as regras, inclusive uma campanha promocional ativa para
// o produto (decisão confirmada com o usuário: o especial tem prioridade máxima).
test('an active special price overrides an active campaign price for the same product', function () {
    $tenant = prpTenant('camp');
    $owner = prpOwner($tenant, 'camp');
    $region = prpRegion($tenant, 'Fronteira Campanha');
    $product = prpProduct($tenant, 'CAMP', 100);
    $campaign = prpCampaign($tenant, $product, 20); // -20% => 80
    $customer = prpCustomer($tenant, $region, 'CAMP-1');

    // Sem preço especial: a campanha vence normalmente.
    expect((new RegionalPriceResolver)->effectivePriceForSale($product, $region, $campaign->commercialCondition))->toBe(80.0);

    // Com preço especial ativo: ele vence a campanha.
    prpSpecialPrice($tenant, $product, $region, 90);
    expect((new RegionalPriceResolver)->effectivePriceForSale($product, $region, $campaign->commercialCondition))->toBe(90.0);

    // Fim a fim: pedido com a campanha usa o preço especial, não o preço promocional.
    $this->actingAs($owner)->post(route('app.orders.store'), [
        'customer_id' => $customer->id,
        'campaign_id' => $campaign->id,
        'items' => [
            ['product_id' => $product->id, 'quantity' => 1, 'price' => 90, 'name' => $product->name, 'total' => 90],
        ],
    ])->assertSessionDoesntHaveErrors()->assertRedirect(route('app.orders.index'));

    $order = Order::where('customer_id', $customer->id)->firstOrFail();
    expect((float) $order->orderItems()->first()->price)->toBe(90.0);
});

// O checkbox "Aplicar preço especial" também precisa funcionar na tela de inserção do
// produto (cadastro), não só na edição.
test('a special price can be applied already when creating the product', function () {
    $tenant = prpTenant('new');
    $owner = prpOwner($tenant, 'new');
    $region = prpRegion($tenant, 'Fronteira Novo Produto');

    $this->actingAs($owner)->post(route('app.products.store'), [
        'name' => 'Produto Novo',
        'reference' => 'REF-NOVO-01',
        'description' => 'Produto criado com preço especial',
        'unity' => 'UN',
        'measure' => 1,
        'price' => 100,
        'quantity' => 10,
        'min_quantity' => 1,
        'enabled' => true,
        'apply_special_price' => true,
        'special_price_region_id' => $region->id,
        'special_price_value' => 89.9,
    ])->assertSessionDoesntHaveErrors()->assertRedirect(route('app.products.index'));

    $product = Product::where('reference', 'REF-NOVO-01')->firstOrFail();
    $special = ProductRegionPrice::where('product_id', $product->id)->where('region_id', $region->id)->firstOrFail();
    expect((float) $special->special_price)->toBe(89.9)
        ->and($special->is_active)->toBeTrue();
});

// Marcar o checkbox sem preencher os campos deve ser rejeitado.
test('checking apply special price without region and value is rejected on creation', function () {
    $tenant = prpTenant('new2');
    $owner = prpOwner($tenant, 'new2');

    $this->actingAs($owner)->post(route('app.products.store'), [
        'name' => 'Produto Novo 2',
        'reference' => 'REF-NOVO-02',
        'description' => 'x',
        'unity' => 'UN',
        'measure' => 1,
        'price' => 100,
        'quantity' => 10,
        'min_quantity' => 1,
        'enabled' => true,
        'apply_special_price' => true,
    ])->assertSessionHasErrors(['special_price_region_id', 'special_price_value']);

    expect(Product::where('reference', 'REF-NOVO-02')->exists())->toBeFalse();
});

// A listagem inicial de produtos deve mostrar o preço especial ativo (por região) no lugar
// do/junto do preço base; produtos sem exceção continuam mostrando só o preço base.
test('the products listing shows active special prices per region', function () {
    $tenant = prpTenant('list');
    $owner = prpOwner($tenant, 'list');
    $fronteira = prpRegion($tenant, 'Fronteira Listagem');
    $serra = prpRegion($tenant, 'Serra Listagem');

    $withSpecial = prpProduct($tenant, 'LIST-A', 100);
    prpSpecialPrice($tenant, $withSpecial, $fronteira, 89.9);
    prpSpecialPrice($tenant, $withSpecial, $serra, 92);

    $withInactiveSpecial = prpProduct($tenant, 'LIST-B', 60);
    prpSpecialPrice($tenant, $withInactiveSpecial, $fronteira, 55, ['is_active' => false]);

    $withoutSpecial = prpProduct($tenant, 'LIST-C', 30);

    $response = $this->actingAs($owner)->get(route('app.products.index'));
    $response->assertOk();

    $products = collect($response->viewData('page')['props']['products']['data']);

    $productA = $products->firstWhere('id', $withSpecial->id);
    expect($productA['special_prices'])->toHaveCount(2);
    expect(collect($productA['special_prices'])->pluck('special_price')->sort()->values()->all())->toBe([89.9, 92.0]);

    $productB = $products->firstWhere('id', $withInactiveSpecial->id);
    expect($productB['special_prices'])->toBeEmpty();

    $productC = $products->firstWhere('id', $withoutSpecial->id);
    expect($productC['special_prices'])->toBeEmpty();
});
