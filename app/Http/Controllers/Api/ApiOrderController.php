<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Flex;
use App\Models\Order;
use App\Models\Product;
use App\Support\FlexBalance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;

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
        $tenantId = $request->user()->tenant_id;
        $customerRule = Rule::exists('customers', 'id')->where(function ($query) use ($request, $tenantId) {
            $query->where('tenant_id', $tenantId);

            if (! $request->user()->canManageTeam()) {
                $query->whereIn('region_id', $request->user()->regions()->pluck('regions.id'));
            }
        });
        $validatedData = $request->validate([
            'customer_id' => ['required', $customerRule],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => [
                'required',
                Rule::exists('products', 'id')->where('tenant_id', $tenantId),
            ],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'gt:0'], // 'gt:0' é uma boa adição
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.name' => ['required', 'string'], // min:0 não é necessário aqui
            'items.*.total' => ['required', 'numeric', 'min:0'],
            'flex' => ['nullable', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
        ]);

        try {
            abort_unless(Customer::visibleTo()->whereKey($validatedData['customer_id'])->exists(), 404);

            DB::beginTransaction();

            $flexAmount = (float) ($validatedData['flex'] ?? 0);
            $discountAmount = (float) ($validatedData['discount'] ?? 0);
            $subtotal = collect($validatedData['items'])
                ->sum(fn (array $item) => (float) $item['price'] * (int) $item['quantity']);
            $total = max($subtotal + $flexAmount - $discountAmount, 0);

            // 1. Criação do Pedido principal
            $order = Order::create([
                'customer_id' => $validatedData['customer_id'],
                'order_number' => Order::exists() ? Order::latest()->first()->order_number + 1 : 1,
                'flex' => $flexAmount,
                'discount' => $discountAmount,
                'total' => $total,
                'status' => 1,
            ]);

            // 2. Preparar e criar os itens do pedido
            $orderItemsData = collect($validatedData['items'])->map(function ($item) {
                return [
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'name' => $item['name'],
                    'total' => round((float) $item['price'] * (int) $item['quantity'], 2),
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

            FlexBalance::apply($flexAmount, $discountAmount);

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
        $flex = Flex::first()?->value ?? 0;
        $order->load('customer.region', 'orderItems');

        return response()->json([
            'order' => $order,
            'products' => $products,
            'customers' => $customers,
            'flex' => $flex,
            'orderitems' => $order->orderItems,
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
        $this->authorizeVisibleOrder($order);

        try {
            DB::beginTransaction();

            if ($order->status !== '4') {
                foreach ($order->orderItems as $item) {
                    Product::lockForUpdate()->find($item->product_id)?->increment('quantity', $item->quantity);
                }

                FlexBalance::reverse((float) $order->flex, (float) $order->discount);
            }
            $order->orderItems()->delete();
            $order->delete();

            DB::commit();

            return response()->json(['message' => 'Pedido excluído com sucesso.']);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json(['message' => $e->getMessage()], 409);
        }
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

    public function setValueStatusOrderApp(Request $request, Order $order)
    {
        $this->authorizeVisibleOrder($order);
        $validated = $request->validate(['status' => ['required', Rule::in(['1', '2', '3', '4'])]]);

        if ($validated['status'] === '4') {
            return $this->cancelOrderApp($order);
        }

        $order->update(['status' => $validated['status']]);

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

            FlexBalance::reverse((float) $order->flex, (float) $order->discount);

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
                'message' => $e->getMessage(),
            ], 409);
        }
    }

    private function authorizeVisibleOrder(Order $order): void
    {
        abort_unless(Order::visibleTo()->whereKey($order->id)->exists(), 404);
    }
}
