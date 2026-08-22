<?php

use App\Http\Controllers\Api\ApiAuthController;
use App\Http\Controllers\Api\ApiCustomerController;
use App\Http\Controllers\Api\ApiExpenseController;
use App\Http\Controllers\Api\ApiHomeController;
use App\Http\Controllers\Api\ApiOrderController;
use App\Http\Controllers\Api\ApiProductController;
use App\Http\Controllers\Api\ApiVisitController;
use App\Http\Controllers\MercadoPagoWebhookController;
use App\Http\Middleware\AppApiAccessMiddleware;
use App\Models\TenantModule;
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
    Route::apiResource('/expenses', ApiExpenseController::class);
    Route::patch('/visits/{visit}/check-in', [ApiVisitController::class, 'checkIn']);
    Route::patch('/visits/{visit}/check-out', [ApiVisitController::class, 'checkOut']);
    Route::get('/getproducts/{reference}', [ApiProductController::class, 'getProductsForReference']);
    Route::get('/alldata', [ApiHomeController::class, 'getAllData']);
    Route::get('/flex', [ApiOrderController::class, 'getFlex']);
    Route::post('/dateorders', [ApiOrderController::class, 'getDateOrders']);
    Route::patch('/statusorderapp/{order}', [ApiOrderController::class, 'setValueStatusOrderApp']);
    Route::patch('/cancelorderapp/{order}', [ApiOrderController::class, 'cancelOrderApp']);

    // Controle de Pragas: endpoint versionado, ainda um placeholder técnico
    // (Etapa 2). Os endpoints reais do app móvel chegam na Etapa 5.
    Route::middleware('module:'.TenantModule::KEY_PEST_CONTROL)
        ->prefix('pest-control/v1')
        ->name('pest-control.v1.')
        ->group(function () {
            Route::get('/status', fn () => response()->json(['module' => 'pest_control', 'status' => 'active']));
        });
});
