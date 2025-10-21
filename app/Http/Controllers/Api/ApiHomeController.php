<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Flex;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;

class ApiHomeController extends Controller
{
    public function getAllData()
    {
        $users = User::get();
        $orders = Order::with('customer')->get();
        $products = Product::get();
        $customers = Customer::get();
        $flex = Order::sum('flex');
        $discount = Order::sum('discount');


        $dataApp = [
            "user" => $users,
            "orders" => $orders,
            "products" => $products,
            "customers" => $customers,
            "flex" => $flex,
            "discount" => $discount
        ];

        return response()->json([
            'success' => true,
            'data' => $dataApp
        ]);
    }
}
