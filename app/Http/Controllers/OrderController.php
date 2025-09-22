<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Flex;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('q');

        $query = Order::orderBy('id', 'DESC');
        // $query->where('id', $search);
        // if ($search) {
        //     $query->where('name', 'like', '%' . $search . '%')
        //         ->orWhere('reference', 'like', '%' . $search . '%');
        // }

        $orders = $query->with('customer')->paginate(12);
        return Inertia::render('app/orders/index', ["orders" => $orders]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $products = Product::all();
        $customers = Customer::all();
        $flex = Flex::first();
        return Inertia::render('app/orders/create-order', ['products' => $products, 'customers' => $customers, 'flex' => $flex]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $otherData = $request->all();
        $validatedData = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.name' => ['required', 'string', 'min:0'],
            'items.*.total' => ['required', 'numeric', 'min:0'],
        ]);

        try {
            DB::beginTransaction();

            // 3. Criação do Pedido principal
            // `status` é um campo que você pode definir como 'pendente' por padrão
            $order = Order::create([
                'customer_id' => $validatedData['customer_id'],
                'order_number' => Order::exists() ? Order::latest()->first()->order_number + 1 : 1,
                'flex' => $otherData['flex'] ?? '0',
                'discount' => $otherData['discount'] ?? '0',
                'total' => $otherData['total'],
                'status' => 'pendente',
            ]);

            // 4. Preparar os dados dos itens para gravação em massa
            $orderItemsData = collect($validatedData['items'])->map(function ($item) {
                return [
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'name' => $item['name'],
                    'total' => $item['total'],
                ];
            })->toArray();

            $order->orderItems()->createMany($orderItemsData);

            $flexBalance = Flex::firstOrCreate(
                ['value' => 0]
            );

            // 2. Converte os valores
            $flexAmount = (float) ($otherData['flex'] ?? 0);
            $discountAmount = (float) ($otherData['discount'] ?? 0);

            // 3. Opera no registro
            if ($flexAmount > 0) {
                $flexBalance->increment('value', $flexAmount);
            }

            if ($discountAmount > 0) {
                $flexBalance->decrement('value', $discountAmount);
            }

            DB::commit();

            return redirect()->route('app.orders.index')->with('success', 'Pedido criado com sucesso!');
        } catch (\Exception $e) {
            // Em caso de erro, desfaz todas as operações de banco de dados
            DB::rollBack();

            // Opcionalmente, você pode logar o erro para depuração
            // Log::error('Erro ao salvar o pedido: ' . $e->getMessage());

            // Retorna com uma mensagem de erro
            return redirect()->back()->with('error', 'Ocorreu um erro ao salvar o pedido. Por favor, tente novamente.' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $products = Product::all();
        $customers = Customer::all();
        $flex = Flex::first();
        $order = Order::with('customer')->with('orderItems')->orderBy('id', 'DESC')->first();
        return Inertia::render('app/orders/edit-order', ['order' => $order, 'products' => $products, 'customers' => $customers, 'flex' => $flex, 'orderitems' => $order->orderItems()]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $order)
    {
        return Redirect::route('app.orders.show', ['order' => $order->id]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        $order->delete();
        return redirect()->route('app.orders.index')->with('success', 'Pedido excluído com sucesso');
    }

    public function setValueStatusOrder(Request $request, $orderid)
    {
        Order::where('id', $orderid)->update(['status' => $request->status]);
        return response()->json([
            'success' => true,
            'message' => 'Status alterado com sucesso.'
        ]);
    }
}
