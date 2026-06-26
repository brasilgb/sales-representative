<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CommercialConditionController;
use App\Http\Controllers\CampaignController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\SalesIntelligenceController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VisitController;
use Illuminate\Support\Facades\Route;

Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/dashboard/export', [DashboardController::class, 'export'])->name('dashboard.export');
Route::get('/subscription', [SubscriptionController::class, 'index'])->name('subscription.index');
Route::patch('/subscription', [SubscriptionController::class, 'update'])->name('subscription.update');
Route::patch('/subscription/onboarding', [SubscriptionController::class, 'onboarding'])->name('subscription.onboarding');
Route::resource('/customers', CustomerController::class);
Route::resource('/regions', RegionController::class);
Route::resource('/visits', VisitController::class);
Route::patch('/visits/{visit}/check-in', [VisitController::class, 'checkIn'])->name('visits.check-in');
Route::patch('/visits/{visit}/check-out', [VisitController::class, 'checkOut'])->name('visits.check-out');
Route::get('/intelligence', [SalesIntelligenceController::class, 'index'])->name('intelligence.index');
Route::resource('/campaigns', CampaignController::class);
Route::get('/commissions', [CommercialConditionController::class, 'commissions'])->name('commissions.index');
Route::resource('/commercial-conditions', CommercialConditionController::class);
Route::resource('/orders', OrderController::class);
Route::get('/report', [OrderController::class, 'orderReport'])->name('orders.report');
Route::resource('/products', ProductController::class);
Route::resource('/settings', SettingController::class);
Route::resource('/users', UserController::class);
Route::get('/refproducts/{reference}', [ProductController::class, 'getProductsReference']);
Route::patch('/statusorder/{order}', [OrderController::class, 'setValueStatusOrder']);
Route::patch('/cancelorder/{order}', [OrderController::class, 'cancelOrder']);
