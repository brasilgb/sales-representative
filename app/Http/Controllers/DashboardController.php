<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Flex;
use App\Models\Order;
use App\Models\Product;
use App\Models\Region;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $filters = $this->filters($request);
        $ordersQuery = $this->filteredOrders($filters);
        $orders = (clone $ordersQuery)->with('customer.region', 'user')->latest()->limit(12)->get();
        $ordersCount = (clone $ordersQuery)->count();
        $salesTotal = (clone $ordersQuery)->sum('total');
        $activeCustomerIds = (clone $ordersQuery)->whereNotNull('customer_id')->distinct('customer_id')->pluck('customer_id');
        $inactiveCutoff = now()->subDays(60);

        $kpis_dash = [
            'users' => auth()->user()->canManageTeam()
                ? User::where('tenant_id', auth()->user()->tenant_id)->count()
                : 1,
            'customers' => Customer::visibleTo()->count(),
            'products' => Product::get()->count(),
            'orders' => $ordersCount,
            'sales_total' => $salesTotal,
            'average_ticket' => $ordersCount > 0 ? $salesTotal / $ordersCount : 0,
            'active_customers' => $activeCustomerIds->count(),
            'inactive_customers' => Customer::visibleTo()
                ->whereDoesntHave('orders', fn (Builder $query) => $query->where('created_at', '>=', $inactiveCutoff))
                ->count(),
            'flex' => Flex::first(),
        ];

        return Inertia::render('app/dashboard/index', [
            'kpis_dash' => $kpis_dash,
            'salesOrders' => $orders,
            'filters' => $filters,
            'filterOptions' => $this->filterOptions(),
            'statusBreakdown' => $this->statusBreakdown($ordersQuery),
            'sellerRanking' => $this->sellerRanking($ordersQuery),
            'topProducts' => $this->topProducts($ordersQuery),
            'salesByRegion' => $this->salesByRegion($ordersQuery),
            'salesByBrand' => $this->salesByProductField($ordersQuery, 'brand'),
            'salesByCategory' => $this->salesByProductField($ordersQuery, 'category'),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $filters = $this->filters($request);
        $orders = $this->filteredOrders($filters)->with('customer.region', 'user')->latest()->get();

        return response()->streamDownload(function () use ($orders) {
            $output = fopen('php://output', 'w');
            fputcsv($output, ['Pedido', 'Cliente', 'Regiao', 'Vendedor', 'Status', 'Total', 'Emissao']);

            foreach ($orders as $order) {
                fputcsv($output, [
                    $order->order_number,
                    $order->customer?->name,
                    $order->customer?->region?->name,
                    $order->user?->name,
                    $order->status,
                    number_format((float) $order->total, 2, '.', ''),
                    $order->created_at?->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($output);
        }, 'relatorio-vendas.csv', ['Content-Type' => 'text/csv']);
    }

    private function filters(Request $request): array
    {
        return [
            'start_date' => $request->date('start_date')?->toDateString() ?? now()->startOfMonth()->toDateString(),
            'end_date' => $request->date('end_date')?->toDateString() ?? now()->toDateString(),
            'user_id' => auth()->user()->canManageTeam() ? ($request->integer('user_id') ?: null) : auth()->id(),
            'region_id' => $request->integer('region_id') ?: null,
            'category' => $request->get('category') ?: null,
        ];
    }

    private function filteredOrders(array $filters): Builder
    {
        return Order::visibleTo()
            ->whereBetween('created_at', [
                Carbon::parse($filters['start_date'])->startOfDay(),
                Carbon::parse($filters['end_date'])->endOfDay(),
            ])
            ->when($filters['user_id'], fn (Builder $query) => $query->where('user_id', $filters['user_id']))
            ->when($filters['region_id'], fn (Builder $query) => $query->whereHas('customer', fn (Builder $query) => $query->where('region_id', $filters['region_id'])))
            ->when($filters['category'], fn (Builder $query) => $query->whereHas('orderItems.product', fn (Builder $query) => $query->where('category', $filters['category'])));
    }

    private function filterOptions(): array
    {
        return [
            'users' => auth()->user()->canManageTeam()
                ? User::where('tenant_id', auth()->user()->tenant_id)->where('status', true)->orderBy('name')->get(['id', 'name'])
                : collect([auth()->user()]),
            'regions' => auth()->user()->canManageTeam()
                ? Region::where('status', true)->orderBy('name')->get(['id', 'name'])
                : auth()->user()->regions()->where('status', true)->orderBy('name')->get(['regions.id', 'regions.name']),
            'categories' => Product::whereNotNull('category')->distinct()->orderBy('category')->pluck('category')->values(),
        ];
    }

    private function statusBreakdown(Builder $ordersQuery)
    {
        return (clone $ordersQuery)
            ->select('status', DB::raw('count(*) as orders_count'), DB::raw('sum(total) as total'))
            ->groupBy('status')
            ->orderBy('status')
            ->get();
    }

    private function sellerRanking(Builder $ordersQuery)
    {
        return (clone $ordersQuery)
            ->select('user_id', DB::raw('count(*) as orders_count'), DB::raw('sum(total) as total'), DB::raw('avg(total) as average_ticket'))
            ->with('user:id,name')
            ->groupBy('user_id')
            ->orderByDesc('total')
            ->limit(8)
            ->get();
    }

    private function topProducts(Builder $ordersQuery)
    {
        $orderIds = (clone $ordersQuery)->pluck('id');

        return DB::table('order_items')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->whereIn('order_items.order_id', $orderIds)
            ->select('products.id', 'products.name', 'products.category', 'products.brand', DB::raw('sum(order_items.quantity) as quantity'), DB::raw('sum(order_items.total) as total'))
            ->groupBy('products.id', 'products.name', 'products.category', 'products.brand')
            ->orderByDesc('total')
            ->limit(10)
            ->get();
    }

    private function salesByRegion(Builder $ordersQuery)
    {
        $orderIds = (clone $ordersQuery)->pluck('id');

        return DB::table('orders')
            ->leftJoin('customers', 'customers.id', '=', 'orders.customer_id')
            ->leftJoin('regions', 'regions.id', '=', 'customers.region_id')
            ->whereIn('orders.id', $orderIds)
            ->select(DB::raw("coalesce(regions.name, 'Sem região') as label"), DB::raw('count(*) as orders_count'), DB::raw('sum(orders.total) as total'))
            ->groupBy('label')
            ->orderByDesc('total')
            ->get();
    }

    private function salesByProductField(Builder $ordersQuery, string $field)
    {
        $orderIds = (clone $ordersQuery)->pluck('id');

        return DB::table('order_items')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->whereIn('order_items.order_id', $orderIds)
            ->select(DB::raw("coalesce(products.$field, 'Sem {$field}') as label"), DB::raw('sum(order_items.total) as total'), DB::raw('sum(order_items.quantity) as quantity'))
            ->groupBy('label')
            ->orderByDesc('total')
            ->limit(8)
            ->get();
    }
}
