<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        $orders = $query->paginate(12);
        return Inertia::render('app/orders/index', ["orders" => $orders]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $products = Product::all();
        $customers = Customer::all();
        return Inertia::render('app/orders/create-order', ['products' => $products, 'customers' => $customers]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $otherData = $request->all();

// 1. Validação dos dados
        // 'client_id' é obrigatório e deve existir na tabela de 'clients'
        // 'items' é obrigatório e deve ser um array
        // Cada item no array de 'items' deve ter 'product_id', 'quantity' e 'price'
        $validatedData = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.name' => ['required', 'string', 'min:0'],
            'items.*.total' => ['required', 'numeric', 'min:0'],
        ]);
// dd($validatedData);
        // 2. Transação de banco de dados
        // Garante que todas as operações (criar pedido e itens) sejam atômicas.
        // Se qualquer parte falhar, tudo é desfeito.
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
            // dd($order);
            // dd($orderItemsData);
            // 5. Salvar os itens do pedido
            // O método `createMany` do Eloquent é a forma mais eficiente de
            // salvar múltiplos registros relacionados de uma vez.
            $order->orderItems()->createMany($orderItemsData);

            // Se tudo deu certo, comita a transação
            DB::commit();

            // 6. Redirecionar para a tela de listagem de pedidos
            // A função `back()` é útil para retornar para a página anterior, mas para este caso,
            // é melhor redirecionar para uma rota específica.
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
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Order $order)
    {
        //
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
}
