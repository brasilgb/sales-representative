<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('q');

        $query = Product::orderBy('id', 'DESC');

        if ($search) {
            $query->where('name', 'like', '%' . $search . '%')
                ->orWhere('reference', 'like', '%' . $search . '%');
        }

        $products = $query->paginate(12);
        return Inertia::render('app/products/index', ["products" => $products]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('app/products/create-product');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductRequest $request): RedirectResponse
    {
        $data = $request->all();
        $request->validated();

        $product = Product::updateOrCreate(
            [
                'reference' => $data['reference']
            ],
            [
                'name' => $data['name'],
                'description' => $data['description'],
                'unity' => $data['unity'],
                'measure' => $data['measure'],
                'price' => $data['price'],
                'min_quantity' => $data['min_quantity'],
                'enabled' => $data['enabled']
            ]
        );
        $product->increment('quantity', $data['quantity']);

        return redirect()->route('app.products.index')->with('success', 'Produto cadastrado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        return Inertia::render('app/products/edit-product', ['product' => $product]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        return Redirect::route('app.products.show', ['product' => $product->id]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $product->update($data);
        return redirect()->route('app.products.show', ['product' => $product->id])->with('success', 'Produto alterado com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->route('app.products.index')->with('success', 'Produto excluido com sucesso!');
    }

        public function getProductsReference(Request $request)
    {
        $product = Product::where('reference', $request->reference)->first();
        return response()->json([
            "success" => true,
            "product" => $product
        ]);
    }
}
