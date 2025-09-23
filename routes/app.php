<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
Route::resource('customers', CustomerController::class);
Route::resource('orders', OrderController::class);
Route::resource('products', ProductController::class);
Route::resource('settings', SettingController::class);
Route::resource('users', UserController::class);
Route::get('refproducts/{reference}', [ProductController::class, 'getProductsReference']);
Route::patch('statusorder/{order}', [OrderController::class, 'setValueStatusOrder']);
Route::patch('cancelorder/{order}', [OrderController::class, 'cancelOrder']);