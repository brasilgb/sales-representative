<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ApiCustomerController;
use App\Http\Controllers\ApiOrderController;
use App\Http\Controllers\ApiProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('customers', ApiCustomerController::class);
    Route::apiResource('orders', ApiOrderController::class);
    Route::apiResource('products', ApiProductController::class);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
