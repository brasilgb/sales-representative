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
            'users' => User::first(),
            'customers' => Customer::get()->count(),
            'products' => Product::get()->count(),
            'orders' => Order::get()->count(),
            'flex' => Flex::first()
        ];
        $salesOrders = Order::with('customer')->whereDate('created_at', Carbon::now()->format('Y-m-d'))->get();

        return Inertia::render('app/dashboard/index', ['kpis_dash' => $kpis_dash, 'salesOrders' => $salesOrders]);
    }
}
