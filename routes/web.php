<?php

use App\Http\Controllers\Site\HomeController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CampaignController;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/privacidade', fn () => Inertia::render('site/privacy/index'))->name('privacy');
Route::get('/termos', fn () => Inertia::render('site/terms/index'))->name('terms');
Route::get('/ofertas/{token}', [CampaignController::class, 'publicCatalog'])->name('campaigns.public');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
