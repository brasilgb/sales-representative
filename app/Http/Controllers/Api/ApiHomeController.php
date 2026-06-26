<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\Region;
use App\Models\User;

class ApiHomeController extends Controller
{
    public function getAllData()
    {
        $currentUser = auth()->user();

        $users = $currentUser?->canManageTeam()
            ? User::get()
            : User::whereKey($currentUser?->id)->get();
        $orders = Order::visibleTo()->with('customer.region')->get();
        $products = Product::get();
        $customers = Customer::visibleTo()->with('region')->get();
        $regions = $currentUser?->canManageTeam()
            ? Region::where('status', true)->orderBy('name')->get()
            : $currentUser?->regions()->where('status', true)->orderBy('name')->get();
        $flex = Order::visibleTo()->sum('flex');
        $discount = Order::visibleTo()->sum('discount');

        $dataApp = [
            'user' => $users,
            'orders' => $orders,
            'products' => $products,
            'customers' => $customers,
            'regions' => $regions,
            'flex' => $flex,
            'discount' => $discount,
        ];

        return response()->json([
            'success' => true,
            'data' => $dataApp,
        ]);
    }
}
