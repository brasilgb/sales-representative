<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Expense;
use App\Models\Order;
use App\Models\Product;
use App\Models\Region;
use App\Models\User;
use App\Models\Visit;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PerformanceReportController extends Controller
{
    private const EXPENSE_CATEGORIES = [
        'mileage' => 'Quilometragem',
        'food' => 'Alimentação',
        'lodging' => 'Hospedagem',
        'other' => 'Outros gastos',
    ];

    public function sales(Request $request): Response
    {
        $filters = $this->filters($request);
        $allOrders = $this->orders($filters);
        $validOrders = (clone $allOrders)->where('status', '!=', '4');
        $orderIds = (clone $validOrders)->pluck('id');
        $ordersCount = (clone $validOrders)->count();
        $salesTotal = (float) (clone $validOrders)->sum('total');

        return Inertia::render('app/reports/sales', [
            'filters' => $filters,
            'filterOptions' => $this->filterOptions(),
            'summary' => [
                'sales_total' => $salesTotal,
                'orders_count' => $ordersCount,
                'average_ticket' => $ordersCount ? $salesTotal / $ordersCount : 0,
                'customers_count' => (clone $validOrders)->distinct('customer_id')->count('customer_id'),
                'canceled_count' => (clone $allOrders)->where('status', '4')->count(),
                'canceled_total' => (float) (clone $allOrders)->where('status', '4')->sum('total'),
            ],
            'statusBreakdown' => (clone $allOrders)
                ->select('status', DB::raw('count(*) as orders_count'), DB::raw('sum(total) as total'))
                ->groupBy('status')->orderBy('status')->get(),
            'salesByRegion' => DB::table('orders')
                ->leftJoin('customers', 'customers.id', '=', 'orders.customer_id')
                ->leftJoin('regions', 'regions.id', '=', 'customers.region_id')
                ->whereIn('orders.id', $orderIds)
                ->select(DB::raw("coalesce(regions.name, 'Sem região') as label"), DB::raw('count(*) as orders_count'), DB::raw('sum(orders.total) as total'))
                ->groupBy('label')->orderByDesc('total')->get(),
            'salesByCampaign' => DB::table('orders')
                ->leftJoin('campaigns', 'campaigns.id', '=', 'orders.campaign_id')
                ->whereIn('orders.id', $orderIds)
                ->select(DB::raw("coalesce(campaigns.name, 'Sem campanha') as label"), DB::raw('count(*) as orders_count'), DB::raw('sum(orders.total) as total'))
                ->groupBy('label')->orderByDesc('total')->get(),
            'topProducts' => DB::table('order_items')
                ->join('products', 'products.id', '=', 'order_items.product_id')
                ->whereIn('order_items.order_id', $orderIds)
                ->select('products.id', 'products.name', 'products.category', 'products.brand', DB::raw('sum(order_items.quantity) as quantity'), DB::raw('sum(order_items.total) as total'))
                ->groupBy('products.id', 'products.name', 'products.category', 'products.brand')
                ->orderByDesc('total')->limit(12)->get(),
            'orders' => (clone $allOrders)->with('customer.region', 'user:id,name', 'campaign:id,name')->latest()->paginate(20)->withQueryString(),
        ]);
    }

    public function sellers(Request $request): Response
    {
        $filters = $this->filters($request);
        $users = auth()->user()->canManageTeam()
            ? User::where('status', true)->orderBy('name')->get(['id', 'name'])
            : User::whereKey(auth()->id())->get(['id', 'name']);
        $orders = $this->orders($filters)->get();
        $visits = Visit::visibleTo()
            ->whereBetween('scheduled_at', [Carbon::parse($filters['start_date'])->startOfDay(), Carbon::parse($filters['end_date'])->endOfDay()])
            ->when($filters['user_id'], fn (Builder $query) => $query->where('user_id', $filters['user_id']))
            ->when($filters['region_id'], fn (Builder $query) => $query->whereHas('customer', fn (Builder $query) => $query->where('region_id', $filters['region_id'])))
            ->get();

        $performance = $users->map(function (User $user) use ($orders, $visits) {
            $sellerOrders = $orders->where('user_id', $user->id);
            $validOrders = $sellerOrders->where('status', '!=', '4');
            $sellerVisits = $visits->where('user_id', $user->id);
            $completedVisits = $sellerVisits->where('status', 'completed');
            $salesTotal = (float) $validOrders->sum('total');
            $ordersCount = $validOrders->count();

            return [
                'user_id' => $user->id,
                'name' => $user->name,
                'sales_total' => $salesTotal,
                'orders_count' => $ordersCount,
                'average_ticket' => $ordersCount ? $salesTotal / $ordersCount : 0,
                'customers_count' => $validOrders->pluck('customer_id')->filter()->unique()->count(),
                'commission_total' => (float) $validOrders->sum('commission_amount'),
                'visits_count' => $sellerVisits->count(),
                'completed_visits' => $completedVisits->count(),
                'sales_visits' => $completedVisits->where('result', 'sold')->count(),
                'conversion_rate' => $completedVisits->count() ? ($completedVisits->where('result', 'sold')->count() / $completedVisits->count()) * 100 : 0,
                'canceled_orders' => $sellerOrders->where('status', '4')->count(),
            ];
        })->sortByDesc('sales_total')->values();

        return Inertia::render('app/reports/sellers', [
            'filters' => $filters,
            'filterOptions' => $this->filterOptions(),
            'summary' => [
                'sales_total' => $performance->sum('sales_total'),
                'orders_count' => $performance->sum('orders_count'),
                'customers_count' => $orders->where('status', '!=', '4')->pluck('customer_id')->filter()->unique()->count(),
                'visits_count' => $performance->sum('visits_count'),
                'completed_visits' => $performance->sum('completed_visits'),
                'sales_visits' => $performance->sum('sales_visits'),
                'commission_total' => $performance->sum('commission_total'),
            ],
            'performance' => $performance,
        ]);
    }

    public function expenses(Request $request): Response
    {
        $filters = $this->filters($request);
        $expenses = $this->expensesQuery($filters);
        $allExpenses = (clone $expenses)->with('user:id,name')->orderBy('expense_date')->get();
        $users = auth()->user()->canManageTeam()
            ? User::where('status', true)->orderBy('name')->get(['id', 'name'])
            : User::whereKey(auth()->id())->get(['id', 'name']);

        if ($filters['user_id']) {
            $users = $users->where('id', $filters['user_id'])->values();
        }

        $bySeller = $users->map(function (User $user) use ($allExpenses) {
            $sellerExpenses = $allExpenses->where('user_id', $user->id);
            $amount = (float) $sellerExpenses->sum('amount');
            $kilometers = (float) $sellerExpenses->sum('kilometers');
            $count = $sellerExpenses->count();

            return [
                'user_id' => $user->id,
                'name' => $user->name,
                'amount' => $amount,
                'kilometers' => $kilometers,
                'count' => $count,
                'average_amount' => $count ? $amount / $count : 0,
            ];
        })->filter(fn (array $seller) => $seller['count'] > 0)->sortByDesc('amount')->values();

        $byCategory = collect(self::EXPENSE_CATEGORIES)->map(function (string $label, string $category) use ($allExpenses) {
            $categoryExpenses = $allExpenses->where('category', $category);

            return [
                'category' => $category,
                'label' => $label,
                'amount' => (float) $categoryExpenses->sum('amount'),
                'kilometers' => (float) $categoryExpenses->sum('kilometers'),
                'count' => $categoryExpenses->count(),
            ];
        })->values();

        return Inertia::render('app/reports/expenses', [
            'filters' => $filters,
            'filterOptions' => [
                'users' => auth()->user()->canManageTeam()
                    ? User::where('status', true)->orderBy('name')->get(['id', 'name'])
                    : collect([auth()->user()->only('id', 'name')]),
                'categories' => collect(self::EXPENSE_CATEGORIES)->map(fn (string $name, string $id) => compact('id', 'name'))->values(),
            ],
            'summary' => [
                'amount' => (float) $allExpenses->sum('amount'),
                'kilometers' => (float) $allExpenses->sum('kilometers'),
                'count' => $allExpenses->count(),
                'sellers_count' => $allExpenses->pluck('user_id')->filter()->unique()->count(),
            ],
            'bySeller' => $bySeller,
            'byCategory' => $byCategory,
            'expenses' => (clone $expenses)->with('user:id,name')->latest('expense_date')->latest('id')->paginate(20)->withQueryString(),
            'canManageTeam' => auth()->user()->canManageTeam(),
        ]);
    }

    public function expenseReport(Request $request): Response
    {
        $filters = $this->filters($request);
        $expenses = $this->expensesQuery($filters)
            ->with('user:id,name')
            ->orderBy('expense_date')
            ->orderBy('id')
            ->get();
        $byCategory = collect(self::EXPENSE_CATEGORIES)->map(function (string $label, string $category) use ($expenses) {
            $categoryExpenses = $expenses->where('category', $category);

            return [
                'category' => $category,
                'label' => $label,
                'amount' => (float) $categoryExpenses->sum('amount'),
                'kilometers' => (float) $categoryExpenses->sum('kilometers'),
                'count' => $categoryExpenses->count(),
            ];
        })->filter(fn (array $category) => $category['count'] > 0)->values();
        $sellerId = $filters['user_id'];

        return Inertia::render('app/reports/expense-report', [
            'expenses' => $expenses,
            'summary' => [
                'amount' => (float) $expenses->sum('amount'),
                'kilometers' => (float) $expenses->sum('kilometers'),
                'count' => $expenses->count(),
            ],
            'byCategory' => $byCategory,
            'filters' => $filters,
            'sellerName' => $sellerId ? User::find($sellerId)?->name : null,
            'categoryName' => $filters['category'] ? self::EXPENSE_CATEGORIES[$filters['category']] ?? $filters['category'] : null,
        ]);
    }

    private function filters(Request $request): array
    {
        return [
            'start_date' => $request->date('start_date')?->toDateString() ?? now()->startOfMonth()->toDateString(),
            'end_date' => $request->date('end_date')?->toDateString() ?? now()->toDateString(),
            'user_id' => auth()->user()->canManageTeam() ? ($request->integer('user_id') ?: null) : auth()->id(),
            'region_id' => $request->integer('region_id') ?: null,
            'category' => $request->get('category') ?: null,
            'campaign_id' => $request->integer('campaign_id') ?: null,
        ];
    }

    private function orders(array $filters): Builder
    {
        return Order::visibleTo()
            ->whereBetween('created_at', [Carbon::parse($filters['start_date'])->startOfDay(), Carbon::parse($filters['end_date'])->endOfDay()])
            ->when($filters['user_id'], fn (Builder $query) => $query->where('user_id', $filters['user_id']))
            ->when($filters['region_id'], fn (Builder $query) => $query->whereHas('customer', fn (Builder $query) => $query->where('region_id', $filters['region_id'])))
            ->when($filters['category'], fn (Builder $query) => $query->whereHas('orderItems.product', fn (Builder $query) => $query->where('category', $filters['category'])))
            ->when($filters['campaign_id'], fn (Builder $query) => $query->where('campaign_id', $filters['campaign_id']));
    }

    private function expensesQuery(array $filters): Builder
    {
        return Expense::visibleTo()
            ->whereBetween('expense_date', [$filters['start_date'], $filters['end_date']])
            ->when($filters['user_id'], fn (Builder $query) => $query->where('user_id', $filters['user_id']))
            ->when($filters['category'], fn (Builder $query) => $query->where('category', $filters['category']));
    }

    private function filterOptions(): array
    {
        return [
            'users' => auth()->user()->canManageTeam()
                ? User::where('status', true)->orderBy('name')->get(['id', 'name'])
                : collect([auth()->user()->only('id', 'name')]),
            'regions' => auth()->user()->canManageTeam()
                ? Region::where('status', true)->orderBy('name')->get(['id', 'name'])
                : auth()->user()->regions()->where('status', true)->orderBy('name')->get(['regions.id', 'regions.name']),
            'categories' => Product::whereNotNull('category')->distinct()->orderBy('category')->pluck('category')->values(),
            'campaigns' => Campaign::orderBy('name')->get(['id', 'name']),
        ];
    }
}
