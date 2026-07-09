<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Product;
use App\Support\PlanLimits;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:60'],
            'brand' => ['nullable', 'string', 'max:80'],
            'line' => ['nullable', 'string', 'max:80'],
        ]);
        $search = trim($filters['q'] ?? '');

        $query = Product::orderBy('id', 'DESC');

        if ($search) {
            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', '%'.$search.'%')
                    ->orWhere('reference', 'like', '%'.$search.'%');
            });
        }

        $query
            ->when($filters['category'] ?? null, fn ($query, $category) => $query->where('category', $category))
            ->when($filters['brand'] ?? null, fn ($query, $brand) => $query->where('brand', $brand))
            ->when($filters['line'] ?? null, fn ($query, $line) => $query->where('line', $line));

        $products = $query->paginate(12)->withQueryString();

        return Inertia::render('app/products/index', [
            'products' => $products,
            'filters' => [
                'q' => $search,
                'category' => $filters['category'] ?? '',
                'brand' => $filters['brand'] ?? '',
                'line' => $filters['line'] ?? '',
            ],
            'filterOptions' => [
                'categories' => Product::query()
                    ->whereNotNull('category')
                    ->where('category', '<>', '')
                    ->distinct()
                    ->orderBy('category')
                    ->pluck('category')
                    ->values(),
                'brands' => Product::query()
                    ->whereNotNull('brand')
                    ->where('brand', '<>', '')
                    ->distinct()
                    ->orderBy('brand')
                    ->pluck('brand')
                    ->values(),
                'lines' => Product::query()
                    ->whereNotNull('line')
                    ->where('line', '<>', '')
                    ->distinct()
                    ->orderBy('line')
                    ->pluck('line')
                    ->values(),
            ],
            'publicCatalogUrl' => route('catalog.public', [
                'token' => $request->user()->tenant->public_catalog_token,
                'v' => $request->user()->tenant->updated_at?->timestamp,
            ]),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorizeProductManagement();

        return Inertia::render('app/products/create-product');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductRequest $request): RedirectResponse
    {
        $this->authorizeProductManagement();
        $data = $request->validated();
        $image = $request->file('image');
        unset($data['image'], $data['remove_image']);
        $productExists = Product::where('reference', $data['reference'])->exists();

        if (! $productExists) {
            PlanLimits::forTenant()->ensureCanCreate('products');
        }

        // $product = Product::updateOrCreate(
        //     [
        //         'reference' => $data['reference']
        //     ],
        //     [
        //         'name' => $data['name'],
        //         'description' => $data['description'],
        //         'unity' => $data['unity'],
        //         'measure' => $data['measure'],
        //         'price' => $data['price'],
        //         'min_quantity' => $data['min_quantity'],
        //         'quantity' => $data['quantity'],
        //         'enabled' => $data['enabled']
        //     ]
        // );
        // $product->increment('quantity', $data['quantity']);
        // 1. Encontre o produto pela referência ou crie uma NOVA INSTÂNCIA (ainda não salva no banco)
        $product = Product::firstOrNew(
            [
                'reference' => $data['reference'],
            ]
        );
        $product->fill([
            'name' => $data['name'],
            'description' => $data['description'],
            'barcode' => $data['barcode'] ?? null,
            'species' => $data['species'] ?? null,
            'category' => $data['category'] ?? null,
            'brand' => $data['brand'] ?? null,
            'line' => $data['line'] ?? null,
            'package_size' => $data['package_size'] ?? null,
            'unity' => $data['unity'],
            'measure' => $data['measure'],
            'price' => $data['price'],
            'min_quantity' => $data['min_quantity'],
            'enabled' => $data['enabled'],
            'observations' => $data['observations'] ?? null,
        ]);
        $product->quantity = ($product->quantity ?? 0) + $data['quantity'];
        if ($image) {
            $oldImagePath = $product->image_path;
            $product->image_path = $image->store('products', 'public');

            if ($oldImagePath) {
                Storage::disk('public')->delete($oldImagePath);
            }
        }
        $product->save();

        return redirect()->route('app.products.index')->with('success', 'Produto cadastrado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $this->authorizeProductManagement();

        return Inertia::render('app/products/edit-product', ['product' => $product]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $this->authorizeProductManagement();

        return Redirect::route('app.products.show', ['product' => $product->id]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductRequest $request, Product $product): RedirectResponse
    {
        $this->authorizeProductManagement();
        $data = $request->validated();
        $image = $request->file('image');
        $removeImage = (bool) ($data['remove_image'] ?? false);
        unset($data['image'], $data['remove_image']);
        $data['quantity'] = $product->quantity;
        $data['min_quantity'] = $product->min_quantity;
        $product->update($data);

        if ($image || $removeImage) {
            $oldImagePath = $product->image_path;

            $product->image_path = $image?->store('products', 'public');
            $product->save();

            if ($oldImagePath) {
                Storage::disk('public')->delete($oldImagePath);
            }
        }

        return redirect()->route('app.products.show', ['product' => $product->id])->with('success', 'Produto alterado com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $this->authorizeProductManagement();
        if ($product->image_path) {
            Storage::disk('public')->delete($product->image_path);
        }

        $product->delete();

        return redirect()->route('app.products.index')->with('success', 'Produto excluido com sucesso!');
    }

    public function getProductsReference(Request $request)
    {
        $product = Product::where('reference', $request->reference)->first();

        return response()->json([
            'success' => true,
            'product' => $product,
        ]);
    }

    private function authorizeProductManagement(): void
    {
        abort_unless(auth()->user()?->canManageTeam(), 403);
    }
}
