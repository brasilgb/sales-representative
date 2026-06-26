<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Flex;
use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;

class ApiOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $dateToFilter = Carbon::today();
        if (! Order::visibleTo()->whereDate('created_at', $dateToFilter)->exists()) {
            $dateToFilter = Order::visibleTo()->max('created_at');
        }
        if ($dateToFilter) {
            $orders = Order::visibleTo()
                ->with('customer.region')
                ->whereDate('created_at', $dateToFilter)
                ->latest()
                ->get();
        } else {
            $orders = collect();
        }
        $orders = Order::visibleTo()->with('customer.region')->get();

        return response()->json($orders);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
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
            'items.*.quantity' => ['required', 'integer', 'min:1', 'gt:0'], // 'gt:0' é uma boa adição
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.name' => ['required', 'string'], // min:0 não é necessário aqui
            'items.*.total' => ['required', 'numeric', 'min:0'],
        ]);

        try {
            abort_unless(Customer::visibleTo()->whereKey($validatedData['customer_id'])->exists(), 404);

            DB::beginTransaction();

            // 1. Criação do Pedido principal
            $order = Order::create([
                'customer_id' => $validatedData['customer_id'],
                'order_number' => Order::exists() ? Order::latest()->first()->order_number + 1 : 1,
                'flex' => $otherData['flex'] ?? '0',
                'discount' => $otherData['discount'] ?? '0',
                'total' => $otherData['total'],
                'status' => 1,
            ]);

            // 2. Preparar e criar os itens do pedido
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

            // --- NOVO: LÓGICA PARA DECREMENTAR O ESTOQUE ---
            // 3. Iterar sobre os itens para validar o estoque e decrementar
            foreach ($validatedData['items'] as $item) {
                // Usamos lockForUpdate() para previnir 'race conditions',
                // onde duas pessoas compram o último item ao mesmo tempo.
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                // Verifica se a quantidade em estoque é suficiente
                if ($product->quantity < $item['quantity']) {
                    // Se não houver estoque, lança uma exceção.
                    // Isso vai acionar o DB::rollBack() no bloco catch.
                    throw new \Exception('Estoque insuficiente para o produto: '.$product->name);
                }

                // Decrementa o estoque. O método decrement() é atômico e seguro.
                // Substitua 'stock' pelo nome real da sua coluna de estoque no banco de dados.
                $product->decrement('quantity', $item['quantity']);
            }
            // --- FIM DA NOVA LÓGICA ---

            // 4. Lógica para o Flex por tenant
            $tenantId = null;
            $user = Auth::user();
            if ($user) {
                $tenantId = $user->tenant_id;
            } elseif (function_exists('checkTenantId') && checkTenantId()) {
                $tenantId = session('tenant_id');
            }
            $flexBalance = Flex::firstOrCreate([
                'tenant_id' => $tenantId,
            ], [
                'value' => 0,
            ]);
            $flexAmount = (float) ($otherData['flex'] ?? 0);
            $discountAmount = (float) ($otherData['discount'] ?? 0);

            if ($flexAmount > 0) {
                $flexBalance->increment('value', $flexAmount);
            }
            if ($discountAmount > 0) {
                $flexBalance->decrement('value', $discountAmount);
            }

            DB::commit();

            return response()->json(['message' => 'Pedido criado com sucesso!'], 201);
            // return redirect()->route('app.orders.index')->with('success', 'Pedido criado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            // Retorna com a mensagem de erro específica (inclusive a de estoque)
            return response()->json(['message' => 'Ocorreu um erro: '.$e->getMessage()], 400);
            // return redirect()->back()->with('error', 'Ocorreu um erro: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $this->authorizeVisibleOrder($order);

        $products = Product::all();
        $customers = Customer::visibleTo()->get();
        $flex = Flex::first()->value;
        $order = Order::visibleTo()->with('customer.region')->with('orderItems')->orderBy('id', 'DESC')->first();

        return response()->json([
            'order' => $order,
            'products' => $products,
            'customers' => $customers,
            'flex' => $flex,
            'orderitems' => $order->orderItems(),
        ]);
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
        //
    }

    public function getFlex()
    {
        $flex = Flex::first();

        return response()->json($flex);
    }

    public function getDateOrders(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $startDate = $request->input('date');
        $sumFlex = Order::visibleTo()->whereDate('created_at', $startDate)->sum('flex');
        $sumDiscount = Order::visibleTo()->whereDate('created_at', $startDate)->sum('discount');
        $sumTotal = Order::visibleTo()->whereDate('created_at', $startDate)->sum('total');
        $orders = Order::visibleTo()->with('customer.region')->whereDate('created_at', $startDate)->get();
        $orderData = [
            'orders' => $orders,
            'sumFlex' => $sumFlex,
            'sumDiscount' => $sumDiscount,
            'sumTotal' => $sumTotal,
        ];

        return response()->json($orderData);
    }

    public function setValueStatusOrderApp(Request $request, $orderid)
    {
        abort_unless(Order::visibleTo()->whereKey($orderid)->exists(), 404);

        Order::where('id', $orderid)->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Status alterado com sucesso.',
        ]);
    }

    public function cancelOrderApp(Order $order)
    {
        $this->authorizeVisibleOrder($order);

        // 💡 Verificação inicial: não se pode cancelar um pedido já cancelado.
        if ($order->status === '4') {
            return response()->json([
                'success' => false,
                'message' => 'Este pedido já foi cancelado.',
            ], 409); // 409 Conflict é um bom status HTTP para isso.
        }

        try {
            DB::beginTransaction();

            // 1. Itera sobre os itens do pedido para devolver ao estoque
            foreach ($order->orderItems as $item) {

                // 🛡️ lockForUpdate() previne que duas pessoas alterem o mesmo produto ao mesmo tempo
                $product = Product::lockForUpdate()->find($item->product_id);

                if ($product) {
                    // Substitua 'stock' pelo nome real da sua coluna de estoque
                    $product->increment('quantity', $item->quantity);
                }
            }

            $flexBalance = Flex::firstOrCreate(['value' => 0]);
            $flexAmount = (float) ($order->flex ?? 0);
            $discountAmount = (float) ($order->discount ?? 0);

            if ($flexAmount > 0) {
                $flexBalance->increment('value', $flexAmount);
            }
            if ($discountAmount > 0) {
                $flexBalance->decrement('value', $discountAmount);
            }

            // 2. Atualiza o status do pedido para 'cancelado'
            $order::where('id', $order->id)->update(['status' => '4']);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Pedido cancelado e estoque atualizado com sucesso.',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            // Em um ambiente de produção, você deveria logar este erro.
            // Log::error('Erro ao cancelar pedido: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Ocorreu um erro ao cancelar o pedido.',
            ], 500); // 500 Internal Server Error
        }
    }

    private function authorizeVisibleOrder(Order $order): void
    {
        abort_unless(Order::visibleTo()->whereKey($order->id)->exists(), 404);
    }
}
