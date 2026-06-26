<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Support\PlanLimits;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SalesIntelligenceController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless(PlanLimits::forTenant()->hasFeature('intelligence'), 403);

        $selectedCustomerId = $request->integer('customer_id') ?: null;
        $customers = Customer::visibleTo()
            ->with('region')
            ->withMax('orders as last_order_at', 'created_at')
            ->orderBy('name')
            ->get();

        $selectedCustomer = $selectedCustomerId
            ? Customer::visibleTo()->with('region')->find($selectedCustomerId)
            : $customers->first();

        $inactiveBuckets = collect([30, 45, 60])->mapWithKeys(function (int $days) {
            return [$days => $this->inactiveCustomers($days)->limit(8)->get()];
        });

        return Inertia::render('app/intelligence/index', [
            'customers' => $customers,
            'selectedCustomer' => $selectedCustomer,
            'inactiveBuckets' => $inactiveBuckets,
            'reorderSuggestions' => $this->reorderSuggestions(),
            'mixReport' => $selectedCustomer ? $this->mixReport($selectedCustomer) : null,
            'campaigns' => Campaign::active()->with('product', 'region')->orderBy('ends_at')->get()->map(function (Campaign $campaign) {
                return [
                    ...$campaign->toArray(),
                    'adherence' => $this->campaignAdherence($campaign),
                ];
            }),
        ]);
    }

    private function inactiveCustomers(int $days): Builder
    {
        $cutoff = now()->subDays($days);

        return Customer::visibleTo()
            ->with('region')
            ->withMax('orders as last_order_at', 'created_at')
            ->where(function (Builder $query) use ($cutoff) {
                $query->whereDoesntHave('orders')
                    ->orWhereDoesntHave('orders', fn (Builder $query) => $query->where('created_at', '>=', $cutoff));
            })
            ->orderBy('name');
    }

    private function reorderSuggestions()
    {
        return Customer::visibleTo()
            ->with([
                'region',
                'latestOrder.orderItems.product',
            ])
            ->whereHas('orders')
            ->withMax('orders as last_order_at', 'created_at')
            ->orderBy('last_order_at')
            ->limit(10)
            ->get()
            ->map(function (Customer $customer) {
                $latestOrder = $customer->latestOrder;

                return [
                    'customer' => $customer,
                    'last_order_at' => $customer->last_order_at,
                    'items' => $latestOrder?->orderItems
                        ->map(fn ($item) => [
                            'product_id' => $item->product_id,
                            'name' => $item->product?->name ?? 'Produto removido',
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                            'total' => $item->total,
                        ])
                        ->values() ?? [],
                ];
            });
    }

    private function mixReport(Customer $customer): array
    {
        $boughtItems = $customer->orders()
            ->with('orderItems.product')
            ->get()
            ->flatMap->orderItems
            ->filter(fn ($item) => $item->product !== null);

        $boughtProductIds = $boughtItems->pluck('product_id')->unique()->values();
        $boughtProducts = $boughtItems
            ->groupBy('product_id')
            ->map(function ($items) {
                $product = $items->first()->product;

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'category' => $product->category,
                    'brand' => $product->brand,
                    'quantity' => $items->sum('quantity'),
                    'total' => $items->sum('total'),
                ];
            })
            ->sortByDesc('total')
            ->values()
            ->take(12);

        $notBoughtProducts = Product::whereNotIn('id', $boughtProductIds)
            ->where('enabled', true)
            ->orderBy('category')
            ->orderBy('brand')
            ->orderBy('name')
            ->limit(12)
            ->get(['id', 'name', 'category', 'brand', 'price']);

        $categoryMix = $boughtProducts
            ->groupBy(fn ($product) => $product['category'] ?: 'sem_categoria')
            ->map(fn ($products, $category) => [
                'category' => $category,
                'products_count' => $products->count(),
                'total' => $products->sum('total'),
            ])
            ->values();

        return [
            'boughtProducts' => $boughtProducts,
            'notBoughtProducts' => $notBoughtProducts,
            'categoryMix' => $categoryMix,
        ];
    }

    private function campaignAdherence(Campaign $campaign): array
    {
        $start = $campaign->starts_at ? Carbon::parse($campaign->starts_at)->startOfDay() : now()->startOfMonth();
        $end = $campaign->ends_at ? Carbon::parse($campaign->ends_at)->endOfDay() : now()->endOfDay();

        $query = Order::visibleTo()
            ->whereBetween('created_at', [$start, $end])
            ->whereHas('orderItems.product', function (Builder $query) use ($campaign) {
                match ($campaign->scope_type) {
                    'product' => $query->where('products.id', $campaign->product_id),
                    'brand' => $query->where('brand', $campaign->brand),
                    'category' => $query->where('category', $campaign->category),
                    default => null,
                };
            });

        if ($campaign->scope_type === 'region') {
            $query = Order::visibleTo()
                ->whereBetween('created_at', [$start, $end])
                ->whereHas('customer', fn (Builder $query) => $query->where('region_id', $campaign->region_id));
        }

        return [
            'orders_count' => (clone $query)->count(),
            'customers_count' => (clone $query)->distinct('customer_id')->count('customer_id'),
            'total' => (clone $query)->sum('total'),
        ];
    }
}
