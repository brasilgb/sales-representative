<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CommercialCondition;
use App\Models\Flex;
use App\Models\Order;
use App\Models\Product;
use App\Support\PlanLimits;
use Illuminate\Http\RedirectResponse;
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

        $query = Order::visibleTo()->orderBy('id', 'DESC');

        if ($search) {
            $query->where(function ($query) use ($search) {
                $query->where('order_number', 'like', '%'.$search.'%')
                    ->orWhereHas('customer', function ($query) use ($search) {
                        $query->where('name', 'like', '%'.$search.'%')
                            ->orWhere('cnpj', 'like', '%'.$search.'%');
                    });
            });
        }

        $orders = $query->with('customer.region', 'user')->paginate(12);

        return Inertia::render('app/orders/index', ['orders' => $orders]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $products = Product::orderBy('name')->get();
        $customers = Customer::visibleTo()
            ->with(['region', 'latestOrder.orderItems.product'])
            ->orderBy('name')
            ->get()
            ->each(function (Customer $customer) {
                $customer->setAttribute('commercial_condition', CommercialCondition::resolveForCustomer($customer));
            });
        $flex = Flex::first();
        $selectedCustomerId = request()->integer('customer_id') ?: null;

        return Inertia::render('app/orders/create-order', [
            'products' => $products,
            'customers' => $customers,
            'flex' => $flex,
            'selectedCustomerId' => $selectedCustomerId,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        PlanLimits::forTenant()->ensureCanCreate('orders_month');

        $otherData = $request->all();
        $validatedData = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'gt:0'], // 'gt:0' é uma boa adição
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.name' => ['required', 'string'], // min:0 não é necessário aqui
            'items.*.total' => ['required', 'numeric', 'min:0'],
            'payment_condition' => ['nullable', 'string', 'max:120'],
        ]);

        try {
            $customer = Customer::visibleTo()->findOrFail($validatedData['customer_id']);
            $commercialCondition = CommercialCondition::resolveForCustomer($customer);

            DB::beginTransaction();

            $subtotal = 0;
            foreach ($validatedData['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $expectedPrice = $commercialCondition ? $commercialCondition->adjustedPrice((float) $product->price) : (float) $product->price;

                if (abs((float) $item['price'] - $expectedPrice) > 0.01) {
                    throw new \Exception('Preço divergente da condição comercial para o produto: '.$product->name);
                }

                $subtotal += $expectedPrice * (int) $item['quantity'];
            }

            $flexAmount = (float) ($otherData['flex'] ?? 0);
            $discountAmount = (float) ($otherData['discount'] ?? 0);
            $total = max($subtotal + $flexAmount - $discountAmount, 0);

            if ($commercialCondition) {
                $discountPercentage = $subtotal > 0 ? ($discountAmount / $subtotal) * 100 : 0;

                if ($discountPercentage > (float) $commercialCondition->max_discount_percentage) {
                    throw new \Exception('Desconto acima do limite permitido para este cliente.');
                }

                if ($total < (float) $commercialCondition->minimum_order_amount) {
                    throw new \Exception('Pedido abaixo do valor mínimo da condição comercial.');
                }
            }

            $commissionPercentage = (float) ($commercialCondition?->commission_percentage ?? 0);
            $commissionAmount = round($total * ($commissionPercentage / 100), 2);

            // 1. Criação do Pedido principal
            $order = Order::create([
                'customer_id' => $validatedData['customer_id'],
                'commercial_condition_id' => $commercialCondition?->id,
                'order_number' => Order::exists() ? Order::latest()->first()->order_number + 1 : 1,
                'flex' => $flexAmount,
                'discount' => $discountAmount,
                'total' => $total,
                'status' => 1,
                'payment_condition' => $validatedData['payment_condition'] ?? $commercialCondition?->payment_terms,
                'commission_percentage' => $commissionPercentage,
                'commission_amount' => $commissionAmount,
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

            // 4. Lógica para o Flex (mantida como estava)
            $flexBalance = Flex::firstOrCreate(['value' => 0]);
            if ($flexAmount > 0) {
                $flexBalance->increment('value', $flexAmount);
            }
            if ($discountAmount > 0) {
                $flexBalance->decrement('value', $discountAmount);
            }

            DB::commit();

            return redirect()->route('app.orders.index')->with('success', 'Pedido criado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            // Retorna com a mensagem de erro específica (inclusive a de estoque)
            return redirect()->back()->with('error', 'Ocorreu um erro: '.$e->getMessage())->withInput();
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
        $flex = Flex::first();
        // Carrega os relacionamentos necessários no modelo já injetado pela rota.
        $order->load('customer', 'orderItems');

        // O método orderItems() retorna a relação, para obter os itens, acesse a propriedade.
        return Inertia::render('app/orders/edit-order', ['order' => $order, 'products' => $products, 'customers' => $customers, 'flex' => $flex, 'orderitems' => $order->orderItems]);
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
    // public function destroy(Order $order)
    // {
    //     $order->delete();
    //     return redirect()->route('app.orders.index')->with('success', 'Pedido excluído com sucesso');
    // }

    /**
     * Remove o pedido do banco de dados e devolve os itens ao estoque.
     *
     * @return RedirectResponse
     */
    public function destroy(Order $order)
    {
        $this->authorizeVisibleOrder($order);

        // Alternativa: verifique se o pedido pode ser deletado
        // Por exemplo, talvez pedidos 'concluídos' não possam ser deletados.
        // if ($order->status === 'concluido') {
        //     return redirect()->back()->with('error', 'Não é possível deletar um pedido já concluído.');
        // }

        try {
            DB::beginTransaction();

            // 1. Itera sobre os itens do pedido para devolver ao estoque
            foreach ($order->orderItems as $item) {
                // Encontra o produto e trava a linha para evitar problemas de concorrência
                $product = Product::lockForUpdate()->find($item->product_id);

                // Se o produto ainda existir, incrementa o estoque
                if ($product) {
                    // Substitua 'stock' pelo nome da sua coluna de estoque
                    $product->increment('quantity', $item->quantity);
                }
            }

            // 2. Deleta os registros de order_items primeiro
            $order->orderItems()->delete();

            // 3. Deleta o pedido principal
            $order->delete();

            DB::commit();

            return redirect()->route('app.orders.index')->with('success', 'Pedido deletado e estoque atualizado com sucesso!');
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->with('error', 'Erro ao deletar o pedido: '.$e->getMessage());
        }
    }

    public function setValueStatusOrder(Request $request, $orderid)
    {
        abort_unless(Order::visibleTo()->whereKey($orderid)->exists(), 404);

        Order::where('id', $orderid)->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Status alterado com sucesso.',
        ]);
    }

    public function cancelOrder(Order $order)
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

    public function orderReport()
    {
        $orders = Order::visibleTo()->with('customer.region', 'user')->get();

        return Inertia::render('app/orders/order-reports', ['orders' => $orders]);
    }
    // public function orderDateReport($date)
    // {
    //     $orders = Order::with('customer')->whereDate('created_at', $date)->get();
    //     return Inertia::render('app/orders/order-report', ["orders" => $orders]);
    // }

    private function authorizeVisibleOrder(Order $order): void
    {
        abort_unless(Order::visibleTo()->whereKey($order->id)->exists(), 404);
    }
}
