<?php

use App\Http\Controllers\Api\ApiAuthController;
use App\Http\Controllers\Api\ApiCustomerController;
use App\Http\Controllers\Api\ApiHomeController;
use App\Http\Controllers\Api\ApiOrderController;
use App\Http\Controllers\Api\ApiProductController;
use App\Http\Controllers\Api\ApiVisitController;
use App\Http\Controllers\MercadoPagoWebhookController;
use App\Http\Middleware\AppApiAccessMiddleware;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    // Route::post('/register', [AuthController::class, 'register']);
    // Route::post('/login', [AuthController::class, 'login']);
    // Route::post('/logout', [AuthController::class, 'logout']);
});

Route::post('/register', [ApiAuthController::class, 'register']);
Route::post('/login', [ApiAuthController::class, 'login']);
Route::post('/forgot-password', [ApiAuthController::class, 'forgotPassword']);
Route::post('/webhooks/mercadopago', MercadoPagoWebhookController::class)->name('webhooks.mercadopago');

Route::middleware(['auth:sanctum', AppApiAccessMiddleware::class])->group(function () {
    Route::match(['get', 'post'], '/user', [ApiAuthController::class, 'getUser']);
    Route::post('/logout', [ApiAuthController::class, 'logOut']);
    Route::apiResource('/customers', ApiCustomerController::class);
    Route::apiResource('/orders', ApiOrderController::class);
    Route::apiResource('/products', ApiProductController::class);
    Route::apiResource('/visits', ApiVisitController::class);
    Route::patch('/visits/{visit}/check-in', [ApiVisitController::class, 'checkIn']);
    Route::patch('/visits/{visit}/check-out', [ApiVisitController::class, 'checkOut']);
    Route::get('/getproducts/{reference}', [ApiProductController::class, 'getProductsForReference']);
    Route::get('/alldata', [ApiHomeController::class, 'getAllData']);
    Route::get('/flex', [ApiOrderController::class, 'getFlex']);
    Route::post('/dateorders', [ApiOrderController::class, 'getDateOrders']);
    Route::patch('/statusorderapp/{order}', [ApiOrderController::class, 'setValueStatusOrderApp']);
    Route::patch('/cancelorderapp/{order}', [ApiOrderController::class, 'cancelOrderApp']);
});
