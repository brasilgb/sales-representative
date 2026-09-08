<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRegionPriceRequest;
use App\Models\Product;
use App\Models\ProductRegionPrice;
use Illuminate\Http\RedirectResponse;

class ProductRegionPriceController extends Controller
{
    public function store(ProductRegionPriceRequest $request, Product $product): RedirectResponse
    {
        $this->authorizeProductManagement();

        $product->regionPrices()->create($request->validated() + ['is_active' => $request->boolean('is_active', true)]);

        return redirect()->route('app.products.show', $product)->with('success', 'Preço especial cadastrado com sucesso!');
    }

    public function update(ProductRegionPriceRequest $request, Product $product, ProductRegionPrice $regionPrice): RedirectResponse
    {
        $this->authorizeProductManagement();
        abort_unless($regionPrice->product_id === $product->id, 404);

        $regionPrice->update($request->validated() + ['is_active' => $request->boolean('is_active', true)]);

        return redirect()->route('app.products.show', $product)->with('success', 'Preço especial alterado com sucesso!');
    }

    public function destroy(Product $product, ProductRegionPrice $regionPrice): RedirectResponse
    {
        $this->authorizeProductManagement();
        abort_unless($regionPrice->product_id === $product->id, 404);

        $regionPrice->delete();

        return redirect()->route('app.products.show', $product)->with('success', 'Preço especial removido com sucesso!');
    }

    private function authorizeProductManagement(): void
    {
        abort_unless(auth()->user()?->canManageTeam(), 403);
    }
}
