<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class ApiHomeController extends Controller
{
    public function getAllData()
    {
        $users = User::get();
        $orders = Order::get();
        $products = Product::get();
        $customers = Customer::get();

        $dataApp = [
            "user" => $users,
            "orders" => $orders,
            "products" => $products,
            "customers" => $customers
        ];

        return response()->json([
            'success' => true,
            'data' => $dataApp
        ]);
    }
}
