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
    // public function store(Request $request)
    // {
    //     $validated = $request->validate([
    //         'reference' => 'required',
    //         'name' => 'required|string',
    //         'description' => 'required',
    //         'unity' => 'required',
    //         'measure' => 'required',
    //         'price' => 'required',
    //         'min_quantity' => 'required',
    //         'quantity' => 'required',
    //         'enabled' => 'required',
    //     ]);

    //     $product = Product::updateOrCreate(
    //         [
    //             'reference' => $validated['reference']
    //         ],
    //         [
    //             'name' => $validated['name'],
    //             'description' => $validated['description'],
    //             'unity' => $validated['unity'],
    //             'measure' => $validated['measure'],
    //             'price' => $validated['price'],
    //             'min_quantity' => $validated['min_quantity'],
    //             'quantity' => $validated['quantity'],
    //             'enabled' => $validated['enabled']
    //         ]
    //     );

    //     $product->increment('quantity', $validated['quantity']);

    //     return response()->json($product, $product->wasRecentlyCreated ? 201 : 200);
    public function store(Request $request)
    {
        $validated = $request->validate([
            'reference' => 'required',
            'name' => 'required',
            'description' => 'required',
            'unity' => 'required',
            'measure' => 'required',
            'price' => 'required',
            'min_quantity' => 'required',
            'quantity' => 'required|min:1', // É bom garantir que a quantidade seja um inteiro >= 1
            'enabled' => 'required',
            'observations' => 'nullable',
        ]);

        // 1. Encontre o produto pela referência ou crie uma NOVA INSTÂNCIA (ainda não salva no banco)
        $product = Product::firstOrNew(
            [
                'reference' => $validated['reference']
            ]
        );

        // 2. Preencha ou atualize os dados do produto, EXCETO a quantidade.
        // O método fill() é seguro contra mass assignment se você tiver a propriedade $fillable no seu Model.
        $product->fill([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'unity' => $validated['unity'],
            'measure' => $validated['measure'],
            'price' => $validated['price'],
            'min_quantity' => $validated['min_quantity'],
            'enabled' => $validated['enabled'],
            'observations' => $validated['observations']
        ]);

        // 3. Agora, manipule a quantidade de forma inteligente
        // Se o produto já existia, `$product->quantity` terá o valor antigo.
        // Se for um novo produto, `$product->quantity` será null.
        // Usamos `?? 0` para tratar o caso de ser um novo produto.
        $product->quantity = ($product->quantity ?? 0) + $validated['quantity'];

        // 4. Salve o produto (seja ele novo ou uma atualização)
        $product->save();
        
        // 5. Retorne a resposta. O Eloquent sabe se o modelo foi criado agora ou não.
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
