<?php

use App\Models\Product;
use App\Models\Tenant;
use Inertia\Testing\AssertableInertia as Assert;

function publicCatalogProduct(Tenant $tenant, array $attributes): Product
{
    $product = new Product(array_merge([
        'name' => 'Produto público',
        'reference' => 'CAT-001',
        'description' => 'Descrição pública',
        'unity' => 'UN',
        'measure' => 1,
        'price' => 19.90,
        'quantity' => 10,
        'min_quantity' => 1,
        'enabled' => true,
    ], $attributes));
    $product->tenant_id = $tenant->id;
    $product->save();

    return $product;
}

test('public product catalog shows only available products and safe company data', function () {
    $this->withoutVite();

    $tenant = Tenant::create([
        'company' => 'Empresa Catálogo Público',
        'logo' => 'logos/empresa-catalogo.png',
        'cnpj' => '88765432000100',
        'email' => 'catalogo-publico@example.com',
        'whatsapp' => '11999999999',
        'status' => 1,
        'payment' => true,
        'expiration_date' => now()->addYear(),
    ]);

    $visible = publicCatalogProduct($tenant, []);
    publicCatalogProduct($tenant, ['name' => 'Produto inativo', 'reference' => 'CAT-002', 'enabled' => false]);
    publicCatalogProduct($tenant, ['name' => 'Produto sem estoque', 'reference' => 'CAT-003', 'quantity' => 0]);

    expect($tenant->public_catalog_token)->not->toBeNull();

    $this->get(route('catalog.public', $tenant->public_catalog_token))
        ->assertOk()
        ->assertSee('<meta property="og:title" content="Catálogo de produtos | Empresa Catálogo Público">', false)
        ->assertSee('<meta property="og:image" content="'.asset('storage/logos/empresa-catalogo.png').'">', false)
        ->assertInertia(fn (Assert $page) => $page
            ->component('site/catalogs/show')
            ->has('company', 3)
            ->where('company.name', $tenant->company)
            ->missing('company.cnpj')
            ->missing('company.email')
            ->has('products', 1)
            ->where('products.0.id', $visible->id)
            ->where('products.0.reference', 'CAT-001')
            ->missing('products.0.quantity')
            ->missing('products.0.observations'));
});

test('unknown public catalog token returns not found', function () {
    $this->get(route('catalog.public', 'catalogo-inexistente'))->assertNotFound();
});
