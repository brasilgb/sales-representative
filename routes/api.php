<?php

use App\Http\Controllers\Api\ApiAuthController;
use App\Http\Controllers\Api\ApiCustomerController;
use App\Http\Controllers\Api\ApiHomeController;
use App\Http\Controllers\Api\ApiOrderController;
use App\Http\Controllers\Api\ApiProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    // Route::post('/register', [AuthController::class, 'register']);
    // Route::post('/login', [AuthController::class, 'login']);
    // Route::post('/logout', [AuthController::class, 'logout']);
});

Route::post('/register', [ApiAuthController::class, 'register']);
Route::post('/login', [ApiAuthController::class, 'login']);
Route::post('/forgot-password', [ApiAuthController::class, 'forgotPassword']);
Route::get('/getproducts/{reference}', [ApiProductController::class, 'getProductsForReference']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/user', [ApiAuthController::class, 'getUser']);
    Route::post('/logout', [ApiAuthController::class, 'logOut']);
    Route::apiResource('/customers', ApiCustomerController::class);
    Route::apiResource('/orders', ApiOrderController::class);
    Route::apiResource('/products', ApiProductController::class);
    Route::get('/alldata', [ApiHomeController::class, 'getAllData']);
    Route::get('/flex', [ApiOrderController::class, 'getFlex']);
    Route::post('/dateorders', [ApiOrderController::class, 'getDateOrders']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
