<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ApiProductController extends Controller
{
    public function getProductsForReference(Request $request)
    {
        $product = Product::where('reference', $request->reference)->first();
        return response()->json([
            "success" => true,
            "product" => $product
        ]);
    }
}
