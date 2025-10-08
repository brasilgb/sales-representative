<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ApiProductController extends Controller
{
    public function getProductsForReference(Request $request)
    {
        $product = Product::where('reference', $request->reference)->first();
        return response()->json([
            "success" => true,
            "product" => $product
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // The TenantScope will automatically filter customers by the current tenant.
        $products = Product::get();
        return response()->json($products);
    }

    /**
     * Store a newly created resource in storage or update an existing one.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reference' => 'required',
            'name' => 'required|string',
            'description' => 'required|string',
            'unity' => 'required|string',
            'measure' => 'required',
            'price' => 'required',
            'min_quantity' => 'required|numeric',
            'quantity' => 'required|numeric',
            'enabled' => 'required|boolean',
        ]);

        $product = Product::updateOrCreate(
            [
                'reference' => $validated['reference']
            ],
            [
                'name' => $validated['name'],
                'description' => $validated['description'],
                'unity' => $validated['unity'],
                'measure' => $validated['measure'],
                'price' => $validated['price'],
                'min_quantity' => $validated['min_quantity'],
                'enabled' => $validated['enabled']
            ]
        );

        $product->increment('quantity', $validated['quantity']);

        return response()->json($product, $product->wasRecentlyCreated ? 201 : 200);
    }


    /**
     * Store a newly created resource in storage or update an existing one.
     */
    public function update(Request $request, Product $product)
    {
        $tenantId = auth()->user()->tenant_id;
        $validated = $request->validate([
            'reference' => 'required', Rule::unique('products')->ignore($product->id)->where('tenant_id', $tenantId),
            'name' => 'required',
            'description' => 'required',
            'unity' => 'required',
            'measure' => 'required',
            'price' => 'required',
            'min_quantity' => 'required',
            'quantity' => 'required',
            'enabled' => 'required',
            'observations' => 'nullable',
        ]);

        $validated['quantity'] = $product->quantity;
        $validated['min_quantity'] = $product->min_quantity;
        // $data = Product::update(
        //     [
        //         'reference' => $validated['reference'],
        //         'name' => $validated['name'],
        //         'description' => $validated['description'],
        //         'unity' => $validated['unity'],
        //         'measure' => $validated['measure'],
        //         'price' => $validated['price'],
        //         'min_quantity' => $validated['min_quantity'],
        //         'quantity' => $validated['quantity'],
        //         'enabled' => $validated['enabled']
        //     ]
        // );
        $product->update($validated);

        return response()->json($product);
    }
}
