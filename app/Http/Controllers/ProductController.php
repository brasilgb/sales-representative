<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProductRequest;
use App\Models\Product;
use App\Models\Region;
use App\Services\Pricing\RegionalPriceResolver;
use App\Support\PlanLimits;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
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

        $query = Product::orderBy('id', 'DESC')
            ->with(['regionPrices' => fn ($query) => $query->active()->with('region:id,name')]);

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

        // Preço efetivo por região: quando o produto tem preço especial ativo em alguma
        // região, ele deve aparecer na listagem no lugar/junto do preço base (ver
        // RegionalPriceResolver — aqui só é exibido, o cálculo já é feito lá).
        $products = $query->paginate(12)->withQueryString()->through(fn (Product $product) => [
            ...Arr::except($product->toArray(), ['region_prices']),
            'special_prices' => $product->regionPrices->map(fn ($regionPrice) => [
                'region_id' => $regionPrice->region_id,
                'region_name' => $regionPrice->region->name,
                'special_price' => (float) $regionPrice->special_price,
            ])->values(),
        ]);

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

        return Inertia::render('app/products/create-product', [
            'regions' => Region::where('status', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductRequest $request): RedirectResponse
    {
        $this->authorizeProductManagement();
        $data = $request->validated();
        $image = $request->file('image');
        $applySpecialPrice = (bool) ($data['apply_special_price'] ?? false);
        $specialPriceData = [
            'region_id' => $data['special_price_region_id'] ?? null,
            'special_price' => $data['special_price_value'] ?? null,
            'valid_from' => $data['special_price_valid_from'] ?? null,
            'valid_until' => $data['special_price_valid_until'] ?? null,
        ];
        unset(
            $data['image'],
            $data['remove_image'],
            $data['apply_special_price'],
            $data['special_price_region_id'],
            $data['special_price_value'],
            $data['special_price_valid_from'],
            $data['special_price_valid_until'],
        );
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

        if ($applySpecialPrice) {
            $product->regionPrices()->updateOrCreate(
                ['region_id' => $specialPriceData['region_id']],
                [
                    'special_price' => $specialPriceData['special_price'],
                    'is_active' => true,
                    'valid_from' => $specialPriceData['valid_from'],
                    'valid_until' => $specialPriceData['valid_until'],
                ],
            );
        }

        return redirect()->route('app.products.index')->with('success', 'Produto cadastrado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product, RegionalPriceResolver $priceResolver)
    {
        $this->authorizeProductManagement();

        return Inertia::render('app/products/edit-product', [
            'product' => $product,
            'regionPrices' => $this->regionPricesFor($product, $priceResolver),
        ]);
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

    /**
     * Ajusta o estoque somando/subtraindo uma diferença (+/-), em vez de sobrescrever um
     * valor absoluto — evita perder decrementos/incrementos de pedidos feitos ao mesmo tempo.
     */
    public function adjustStock(Request $request, Product $product): RedirectResponse
    {
        $this->authorizeProductManagement();

        $data = $request->validate([
            'adjustment' => ['required', 'integer', 'not_in:0'],
        ]);

        DB::transaction(function () use ($product, $data) {
            $locked = Product::lockForUpdate()->findOrFail($product->id);

            if ($data['adjustment'] < 0 && $locked->quantity < abs($data['adjustment'])) {
                throw ValidationException::withMessages([
                    'adjustment' => "O ajuste deixaria o estoque negativo (disponível: {$locked->quantity}).",
                ]);
            }

            $locked->increment('quantity', $data['adjustment']);
        });

        return back()->with('success', 'Estoque ajustado com sucesso!');
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

    /**
     * Monta a tabela "Preços por região" exibida no cadastro do produto: para cada região
     * ativa, mostra o ajuste percentual da região, o preço calculado, o preço especial
     * (quando cadastrado) e o preço efetivamente utilizado — sempre via RegionalPriceResolver,
     * nunca recalculado na tela.
     */
    private function regionPricesFor(Product $product, RegionalPriceResolver $priceResolver): array
    {
        $specialPrices = $product->regionPrices()->get()->keyBy('region_id');

        return Region::where('status', true)
            ->orderBy('name')
            ->get()
            ->map(function (Region $region) use ($product, $priceResolver, $specialPrices) {
                $resolved = $priceResolver->resolve($product, $region);
                $record = $specialPrices->get($region->id);

                return [
                    'region_id' => $region->id,
                    'region_name' => $region->name,
                    ...$resolved,
                    'special' => $record ? [
                        'id' => $record->id,
                        'special_price' => (float) $record->special_price,
                        'is_active' => $record->is_active,
                        'is_currently_valid' => $record->isCurrentlyValid(),
                        'valid_from' => $record->valid_from?->toDateString(),
                        'valid_until' => $record->valid_until?->toDateString(),
                    ] : null,
                ];
            })
            ->values()
            ->toArray();
    }
}
