<?php

use App\Http\Controllers\Admin\BranchController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\FeatureController;
use App\Http\Controllers\Admin\PeriodController;
use App\Http\Controllers\Admin\PlanController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TenantController;
use App\Http\Controllers\Admin\TenantFeedbackEntryController;
use App\Http\Controllers\Admin\TenantModuleController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
Route::patch('/tenants/{tenant}/status', [TenantController::class, 'updateStatus'])->name('tenants.status');
Route::post('/tenants/{tenant}/modules/{module}/activate', [TenantModuleController::class, 'activate'])->name('tenants.modules.activate');
Route::patch('/tenants/{tenant}/modules/{module}/suspend', [TenantModuleController::class, 'suspend'])->name('tenants.modules.suspend');
Route::patch('/tenants/{tenant}/modules/{module}/cancel', [TenantModuleController::class, 'cancel'])->name('tenants.modules.cancel');
Route::patch('/tenants/{tenant}/modules/{module}/reactivate', [TenantModuleController::class, 'reactivate'])->name('tenants.modules.reactivate');
Route::resource('/tenants', TenantController::class);
Route::resource('/branches', BranchController::class);
Route::resource('/plans', PlanController::class);
Route::resource('/features', FeatureController::class);
Route::resource('/periods', PeriodController::class);
Route::resource('/settings', SettingController::class);
Route::get('/feedback', [TenantFeedbackEntryController::class, 'index'])->name('feedback.index');
Route::resource('/users', UserController::class);
