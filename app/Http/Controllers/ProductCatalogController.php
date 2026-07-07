<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Tenant;
use Inertia\Inertia;
use Inertia\Response;

class ProductCatalogController extends Controller
{
    public function show(string $token): Response
    {
        $tenant = Tenant::where('public_catalog_token', $token)->firstOrFail();
        $products = Product::withoutGlobalScopes()
            ->where('tenant_id', $tenant->id)
            ->where('enabled', true)
            ->where('quantity', '>', 0)
            ->orderBy('category')
            ->orderBy('name')
            ->get(['id', 'reference', 'name', 'description', 'brand', 'category', 'package_size', 'price', 'image_path']);

        return Inertia::render('site/catalogs/show', [
            'company' => [
                'name' => $tenant->company,
                'logo_url' => $tenant->logo_url,
                'whatsapp' => $tenant->whatsapp,
            ],
            'products' => $products,
        ]);
    }
}
