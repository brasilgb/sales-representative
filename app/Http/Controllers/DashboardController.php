<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Flex;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $kpis_dash = [
            'users' => auth()->user()->canManageTeam()
                ? User::where('tenant_id', auth()->user()->tenant_id)->count()
                : 1,
            'customers' => Customer::visibleTo()->count(),
            'products' => Product::get()->count(),
            'orders' => Order::visibleTo()->count(),
            'flex' => Flex::first()
        ];
        $salesOrders = Order::visibleTo()->with('customer', 'user')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->get();

        return Inertia::render('app/dashboard/index', ['kpis_dash' => $kpis_dash, 'salesOrders' => $salesOrders]);
    }
}
